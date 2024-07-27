from django.http import JsonResponse
from .models import Game, Pong, PongPlayer, PlayerGameTypeStats, GameHistory
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST, require_GET
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
import requests
from django.shortcuts import render
from .game_manager import update_pong, get_pong_state, move_pong
from django.core.cache import cache


# service comunication
def get_player(session_key, token, user_id):
    response = requests.get('http://auth_service:8000/get_user/', params={'session_key': session_key, 'token': token, 'UserId': user_id}) # TODO verify token instead
    if response.status_code == 200:
        # user = response.json()
        user = User.objects.get(id=user_id)
        return user

        # Check if player exist
        # if Player.objects.filter(name=user['username'], email=user['email']).exists(): # TODO : check not empty
        #     player = Player.objects.get(name=user['username'], email=user['email'])
        # else:
        #     player = Player.objects.create(name=user['username'], email=user['email'])
        return user
    return None

@csrf_exempt # Disable CSRF protection for this view
@require_POST
# end a game party # TODO : check
def leave_game(request):
    try:
        session_key = request.session.session_key
        game_id = request.GET.get('gameId')
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = auth_header.split(' ')[1] if ' ' in auth_header else ''
        user_id = request.GET.get('UserId')

        player = get_player(session_key, token, user_id)
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)

        game = Game.objects.get(id=game_id)  # Get the game
        game.delete()  # End the game # TODO : change this ( delete for now)
        return JsonResponse({'message': 'Game ended', 'game_id': game.id})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)

@csrf_exempt # Disable CSRF protection for this view
@require_GET
# get game party state
def get_game_state(request):
    try:
        game_id = request.GET.get('gameId')
        game_state = get_pong_state(game_id)
        return JsonResponse(game_state)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)

# TODO : make a game list
@require_GET # return a list of all game
def list_game(request):
    # games = Game.objects.all()
    # game_list = []
    # for game in games:
    #     game_dict = model_to_dict(game)
    #     game_dict['players'] = [model_to_dict(player) for player in game.players.all()]
    #     game_list.append(game_dict)
    game_list = ['pong', 'idk']
    return JsonResponse(game_list, safe=False)

def user_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'last_login': user.last_login
    }

@require_GET # return a list of party
def get_party(request): #TODO : send party detail but not all
    try:
        game_id = request.GET.get('gameId')
        if game_id:
            games = Game.objects.filter(id=game_id)
        else:
            games = Game.objects.all()
        game_list = []
        for game in games:
            game_dict = model_to_dict(game)
            game_dict['players'] = [user_to_dict(player) for player in game.players.all()]
            game_list.append(game_dict)
        return JsonResponse(game_list, safe=False)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except:
        return JsonResponse({'error': 'Error'}, status=500)

@require_POST
@csrf_exempt # Disable CSRF protection for this view
# join a game party  # TODO : check
def join_game(request):
    try:
        session_key = request.session.session_key
        game_id = request.GET.get('gameId')
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = auth_header.split(' ')[1] if ' ' in auth_header else ''
        user_id = request.GET.get('UserId')

        player = get_player(session_key, token, user_id)
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)
        

        # Check if a player is already in a game
        if Game.objects.filter(players__in=[player]).exists():
            return JsonResponse({'error': 'Player already in a game'}, status=400)
        
        game = Game.objects.get(id=game_id)  # Get the game

        # Check if party accept player
        if game.gameProperty.playerNumber <= game.players.count():
            return JsonResponse({'error': 'Party full'}, status=400)
        # same as above ?
        if game.status != 'waiting':
            return JsonResponse({'error': 'Game is not waiting for players'}, status=400)

        print(player.name);
        game.players.add(player)  # Add the player to the game
        player = PongPlayer.objects.create(player=player, score=0, n=game.players.count(), token=token)
        game.gameProperty.players.add(player)
        # PartyPlayer.objects.create(party=game, player=player, player_number=game.players.count() + 1)
        # TODO : update status if game.gameProperty.playerNumber == game.players.count()
        game.status = 'playing' if game.players.count() >= game.gameProperty.playerNumber else 'waiting'
        # game.status = 'playing' if game.players.count() == 2 else 'waiting'  # Update the game status
        game.save()

        return JsonResponse({'message': 'Player joined', 'game_id': game.id})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Player not found'}, status=404)

def startPong(request, player, token, gameType):
    
    playerNumber = request.POST.get('playerNumber', 1) # TODO : check default 1 or error ?
    map = request.POST.get('map', 0)
    if not playerNumber or not gameType:
        return JsonResponse({'error': 'Missing setting'}, status=400)
    if int(playerNumber) < 1:
        return JsonResponse({'error': 'Invalid player number'}, status=400)
    pong = Pong.objects.create(playerNumber=playerNumber, mapId=map)
    game = Game.objects.create(gameName='pong', gameProperty=pong)
    game.players.add(player)
    player = PongPlayer.objects.create(player=player, score=0, n=1, token=token)
    game.gameProperty.players.add(player)

    game.status = 'waiting' if int(playerNumber) > 1 else 'playing'

    if (gameType == 'custom'):
        # pong.width = request.POST.get('width', 800)
        # pong.height = request.POST.get('height', 600)
        pong.maxScore = request.POST.get('maxScore', 10)
        pong.ballSpeed = request.POST.get('ballSpeed', 2.0)
        pong.paddleSpeed = request.POST.get('paddleSpeed', 2.0)
        pong.save()

    game.save()
    return JsonResponse({'message': 'Game started', 'game_id': game.id})

# @require_POST
@csrf_exempt # Disable CSRF protection for this view
# create a game party # TODO : check
def start_game(request):
    # try:
    # get user
    session_key = request.session.session_key
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    token = auth_header.split(' ')[1] if ' ' in auth_header else ''
    user_id = request.POST.get('UserId')
    
    player = get_player(session_key, token, user_id)
    if player == None:
        return JsonResponse({'error': 'Failed to get player'}, status=400)
    
    # Check if player is already in a game
    if Game.objects.filter(players__in=[player]).exists():
        return JsonResponse({'error': 'Player already in a game'}, status=400)
    
    # get requested game:
    gameName = request.POST.get('game')
    gameType = request.POST.get('gameType', 'simple')  # Get the game type from the request, default to 'simple'
    if gameName == 'pong':
        return startPong(request, player, token, gameType)
    else:
        return JsonResponse({'error': 'Game not found'}, status=404)
    # except:
    #     return JsonResponse({'error': 'Failed to start game'}, status=400)

@require_POST
@csrf_exempt # Disable CSRF protection for this view
# record a move in the pong game # TODO : change to update game for multiple game
def record_move(request):
    try:    
        session_key = request.session.session_key
        game_id = request.GET.get('gameId')
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token = auth_header.split(' ')[1] if ' ' in auth_header else ''

        player = get_player(session_key, token) # FIXME : TypeError: get_player() missing 1 required positional argument: 'user_id'
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)
        
        game = Game.objects.get(id=game_id)  # Get the game
        if not game.gameProperty.players.get(player=player):
            return JsonResponse({'error': 'Player not in game'}, status=400)
        
        # p = game.gameProperty.players.get(player=player).n
        # print(p)
        
        # players = cache.get('players') # TODO: change all this no cache layer and store player in game_manager.py
        # print(players)
        # game_group_name = f'pong_game_{game_id}'
        # channel_player = players.get(game_group_name)
        # player = channel_player['p1']
        # p = 'p1'


        # if not player.get('token') == token:
        #     player = channel_player['p2']
        #     p = 'p2'
        #     if not player.get('token') == token:
        #         print("back")
        #         return
        direction = request.POST.get('direction')  # Get the direction of the move
        print(direction)
        move_pong(game_id, game.gameProperty.players.get(player=player).n, direction)
        return JsonResponse({'message': 'Move recorded', 'game_id': game_id})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except Player.DoesNotExist: # FIXME : NameError: name 'Player' is not defined
        return JsonResponse({'error': 'Player not found'}, status=404)

@require_GET
@csrf_exempt # Disable CSRF protection for this view
def get_stats(request):
    # Get the stats for the player
    try:
        user_id = request.GET.get('UserId')

        if not user_id:
            return JsonResponse({'error': 'Missing id'}, status=400)
        
        if not User.objects.filter(id=user_id).exists():
            return JsonResponse({'error': 'Player not found'}, status=404)
        
        stats = PlayerGameTypeStats.objects.filter(player_id=user_id)

        all_stats_dict = {}
        for stat in stats:
            stat_dict = model_to_dict(stat)
            stat_dict.pop('player')
            stat_dict.pop('game_type')
            stat_dict.pop('id')
            if stat.game_type.name == 'pong':
                all_stats_dict['pong'] = stat_dict
        return JsonResponse(all_stats_dict, safe=False)
    
    except:
        return JsonResponse({'error': 'Error'}, status=500)
 
@require_GET
@csrf_exempt # Disable CSRF protection for this view   
def get_history(request):
    # Get the history for the player
    try:
        user_id = request.GET.get('UserId')
        if not user_id:
            return JsonResponse({'error': 'Missing id'}, status=400)
        
        if not User.objects.filter(id=user_id).exists():
            return JsonResponse({'error': 'Player not found'}, status=404)
        
        history = GameHistory.objects.filter(player_id=user_id)

        history_list = []
        for hist in history:
            hist_dict = model_to_dict(hist)
            hist_dict.pop('player')
            history_list.append(hist_dict)
        return JsonResponse(history_list, safe=False)
    
    except:
        return JsonResponse({'error': 'Error'}, status=500)
