from django.http import JsonResponse
from .models import Game, Pong, PongPlayer, PlayerGameTypeStats, Tournament, Match, Tron, GameType
from django.contrib.auth.models import User
from django.views.decorators.http import require_POST, require_GET
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
import requests
from django.shortcuts import render
from .game_manager import update_pong, get_pong_state, move_pong
from django.core.cache import cache
import random
from django.utils import timezone
from django.db import transaction


# service comunication
def get_player(session_key, token, user_id):
    try:
        response = requests.get('https://auth-service:8000/get_user/', params={'session_key': session_key, 'token': token, 'UserId': user_id}, verify=False) # TODO verify token instead #verify false for self signed
    except requests.exceptions.RequestException as e: # TODO : remove http (used for processing)
        print(f"HTTPS request failed: {e}, trying HTTP")
        response = requests.get('http://auth-service:8000/get_user/', params={'session_key': session_key, 'token': token, 'UserId': user_id})
    
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


@csrf_exempt
@require_GET
def search(request):
    try:
        query = request.GET.get('query', '')
        try:
            page = int(request.GET.get('page', 1))
            if page <= 0 or page >= 10000:
                page = 1
        except ValueError:
            page = 1

        filters = request.GET.get('filter', '')


        per_page = 10
        start_index = (page - 1) * per_page

        results = {}
        total_results = highest_total = 0

        if 'user' in filters: 
            users = User.objects.filter(username__icontains=query).only('id', 'username')[start_index:start_index + per_page]
            total_results = User.objects.filter(username__icontains=query).count()
            highest_total = total_results
            results['users'] = list(users.values('id', 'username'))

        if 'game' in filters:
            games = Game.objects.filter(gameName__icontains=query).only('id', 'gameName')[start_index:start_index + per_page]
            total_game = Game.objects.filter(gameName__icontains=query).count()
            highest_total = total_results if total_results > total_game else total_game
            total_results += total_game
            results['games'] = list(games.values('id', 'gameName'))

        results['pagination'] = {
            'total_results': total_results,
            'current_page': page,
            'total_pages': (highest_total // per_page) + (1 if highest_total % per_page > 0 else 0)
        }

        return JsonResponse(results)
    except Exception as e:
        print(e, flush=True)
        return JsonResponse({'error': 'Server error'}, status=500)
    

@csrf_exempt
@require_POST
def create_tournament(request):
    try:
        session_key = request.session.session_key
        token = request.COOKIES.get('token')
        user_id = request.COOKIES.get('userId')
        player = get_player(session_key, token, user_id)
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)
    except:
        return JsonResponse({'error': 'Failed to get player'}, status=500)

    try:
        name = request.POST.get('name')
        start_date = request.POST.get('start_date')
        game_name = request.POST.get('game')

        if not all([name, start_date, game_name]):
            return JsonResponse({"success": False, "message": "Missing required fields."}, status=400)
        
        tournament = Tournament.objects.create(max_player=4, name=name, gameName=game_name, start_date=start_date)
        return JsonResponse({"success": True, "message": "Tournament created " + str(tournament.id)})

    except Exception as e:
        return JsonResponse({"success": False, "message": "Failed to create tournament. Error: " + str(e)}, status=500)

@csrf_exempt
@require_POST
def join_tournament(request, tournament_id):
    session_key = request.session.session_key
    token = request.COOKIES.get('token')
    user_id = request.COOKIES.get('userId')
    player = get_player(session_key, token, user_id)
    if player == None:
        return JsonResponse({'error': 'Failed to get player'}, status=400)

    tournament = Tournament.objects.get(id=tournament_id)
    if tournament.players.count() < tournament.max_player:
        player = PongPlayer.objects.create(player=player, score=0, n=1, token=token)
        tournament.players.add(player)
        message = "Joined tournament"
        if tournament.players.count() == tournament.max_player:
            make_matches(tournament)
            message += " and matchmaking started"
    else:
        return JsonResponse({"success": False, "message": "Tournament is full"})
    return JsonResponse({"success": True, "message": message})

def make_matches(tournament):
    players = list(tournament.players.all())
    random.shuffle(players)
    total_players = len(players)
    current_round = 1
    matches_to_create = total_players // 2

    with transaction.atomic(): # all in db operation
        p = current_round
        while matches_to_create > 0:
            for i in range(matches_to_create):
                if p < total_players:
                    game = make_pong_tournament_game(players[p-1], players[p])
                    p+=2
                else:
                    game = make_pong_tournament_game(None, None)
                Match.objects.create(tournament=tournament, round_number=current_round, game=game, match_date=timezone.now())
                current_round += 1
            matches_to_create //= 2

        # Link matches for progression
        matches_to_link = total_players // 2
        # matches_to_link = 1
        round_number = 1
        for i in range(1, matches_to_link): #FIXME : linking match
            next_round = Match.objects.filter(tournament=tournament, round_number=matches_to_link + i).first()
            for j in range(0, 2):
                current_round = Match.objects.filter(tournament=tournament, round_number=round_number + j).first()
                current_round.next_match = next_round
                current_round.save()

def make_pong_tournament_game(player1, player2):
    pong = Pong.objects.create(playerNumber=1, mapId=0)
    game = Game.objects.create(gameName='pong', gameProperty=pong, start_date=timezone.now())
    # if player1:
    #     print("okok", flush=True)
    #     game.players.add(player1.player)
    #     game.gameProperty.players.add(player1)
    #     game.status = 'playing'
    #     game.save()

    if player1 and player2:
        game.players.add(player1.player)
        game.players.add(player2.player)
        game.gameProperty.players.add(player1)
        game.gameProperty.players.add(player2)
    return game


@csrf_exempt
@require_GET
def get_tournament(request, tournament_id):
    if not tournament_id:
        return JsonResponse({'error': 'Tournament ID is required'}, status=400)

    try:
        tournament = Tournament.objects.get(id=tournament_id)
    except Tournament.DoesNotExist:
        return JsonResponse({'error': 'Tournament not found'}, status=404)

    matches = Match.objects.filter(tournament=tournament)
    matches_data = [{
        'id': match.id,
        'player_one': match.game.players.first().id if match.game.players.exists() else None,
        'player_two': match.game.players.last().id if match.game.players.exists() and match.game.players.count() > 1 else None,
        'winner': match.winner.id if match.winner else None,
    } for match in matches]

    tournament_data = {
        'id': tournament.id,
        'name': tournament.name,
        'start_date': tournament.start_date.strftime('%Y-%m-%d %H:%M:%S'),
        'end_date': tournament.end_date.strftime('%Y-%m-%d %H:%M:%S') if tournament.end_date else None,
        'player_number': tournament.max_player,
        'matches': matches_data
    }
    
    return JsonResponse(tournament_data)

@csrf_exempt # Disable CSRF protection for this view
@require_POST
# end a game party
def leave_game(request):
    try:
        session_key = request.session.session_key
        game_id = request.GET.get('gameId')
        token = request.COOKIES.get('token')
        user_id = request.COOKIES.get('userId')

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


@require_GET # return a list of all game
def list_game(request):
    games = GameType.objects.all()
    game_list = []
    for game in games:
        game_list.append(game.name)
    return JsonResponse(game_list, safe=False)

def user_to_dict(user):
    return {
        'id': user.id,
        'username': user.username,
        'last_login': user.last_login
    }

@require_GET # return a list of party
def get_party(request):
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
            game_dict.pop('content_type')
            game_dict.pop('object_id')
            game_list.append(game_dict)
        return JsonResponse(game_list, safe=False)
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except:
        return JsonResponse({'error': 'Error'}, status=500)

@require_POST
@csrf_exempt # Disable CSRF protection for this view
# join a game party
def join_game(request):
    try:
        session_key = request.session.session_key
        game_id = request.GET.get('gameId')
        game_name = request.GET.get('gameName')
        if not game_id and not game_name:
            return JsonResponse({'error': 'Missing field'}, status=400)
        token = request.COOKIES.get('token')
        user_id = request.COOKIES.get('userId')

        player = get_player(session_key, token, user_id)
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)
        

        # Check if a player is already in a game # TODO : check waiting and playing and for start_game() 
        # if Game.objects.filter(status='waiting', players__in=[player]).exists():
        #     return JsonResponse({'error': 'Player already in a game'}, status=400)
        
        if game_id:
            game = Game.objects.get(id=game_id)  # Get the game
        else:
            game = Game.objects.filter(gameName=game_name, status='waiting').order_by('?').first() # Get random game
            if not game:
                return start_game(request, game_name) # No game found, create one # TODO : use and check passed param in join like create
                

        # Check if party accept player
        if game.gameProperty.playerNumber <= game.players.count():
            return JsonResponse({'error': 'Party full'}, status=400)
        # same as above ?
        if game.status != 'waiting':
            return JsonResponse({'error': 'Game is not waiting for players'}, status=400)

        game.players.add(player)  # Add the player to the game
        player = PongPlayer.objects.create(player=player, score=0, n=game.players.count(), token=token)
        game.gameProperty.players.add(player)
        game.status = 'playing' if game.players.count() >= game.gameProperty.playerNumber else 'waiting'
        game.save()

        return JsonResponse({'message': 'Player joined', 'game_id': game.id})
    except Game.DoesNotExist:
        return JsonResponse({'error': 'Game not found'}, status=404)
    except User.DoesNotExist:
        return JsonResponse({'error': 'Player not found'}, status=404)

def startPong(request, player, token, gameType):
    playerNumber = request.POST.get('playerNumber', 1)
    gameMode = request.POST.get('gameMode', 'ffa')
    map = request.POST.get('map', 0)

    if not playerNumber or not gameType:
        return JsonResponse({'error': 'Missing setting'}, status=400)
    if int(playerNumber) < 1:
        return JsonResponse({'error': 'Invalid player number'}, status=400)

    if gameMode == 'team' and int(playerNumber) < 4:
        return JsonResponse({'error': 'Not enough player to play in team'}, status=400)

    pong = Pong.objects.create(playerNumber=playerNumber, mapId=map, gameMode=gameMode)
    party_name = request.POST.get('partyName', 'pong')
    game = Game.objects.create(gameName='pong', gameProperty=pong, start_date=timezone.now(), party_name=party_name)
    game.players.add(player)
    player = PongPlayer.objects.create(player=player, score=0, n=1, token=token)
    game.gameProperty.players.add(player)

    # Ai user
    if int(playerNumber) == 1:
        if not User.objects.filter(username='AI').exists():
            player = User.objects.create_user(username='AI')
        else:
            player = User.objects.get(username='AI')

        game.players.add(player)
        player = PongPlayer.objects.create(player=player, score=0, n=2, token='AI')
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


def startTron(request, player, token, gameType):
    playerNumber = request.POST.get('playerNumber', 1) # TODO : check default 1 or error ?

    if not playerNumber or not gameType:
        return JsonResponse({'error': 'Missing setting'}, status=400)
    if int(playerNumber) < 1:
        return JsonResponse({'error': 'Invalid player number'}, status=400)

    tron = Tron.objects.create(playerNumber=playerNumber)
    party_name = request.POST.get('partyName', 'tron')
    game = Game.objects.create(gameName='tron', gameProperty=tron, start_date=timezone.now(), party_name=party_name)
    game.players.add(player)
    player = PongPlayer.objects.create(player=player, score=0, n=1, token=token)
    game.gameProperty.players.add(player)

    game.status = 'waiting' if int(playerNumber) > 1 else 'playing'

    game.save()
    return JsonResponse({'message': 'Game started', 'game_id': game.id})
    
# @require_POST
@csrf_exempt # Disable CSRF protection for this view
# create a game party
def start_game(request, gameName=None):
    # try:
    # get user
    session_key = request.session.session_key
    token = request.COOKIES.get('token')
    user_id = request.COOKIES.get('userId')

    player = get_player(session_key, token, user_id)
    if player == None:
        return JsonResponse({'error': 'Failed to get player'}, status=400)
    
    # Check if player is already in a game
    # if Game.objects.filter(players__in=[player]).exists():
    #     return JsonResponse({'error': 'Player already in a game'}, status=400)
    
    # get requested game:
    if not gameName:
        gameName = request.POST.get('game')
    gameType = request.POST.get('gameType', 'simple')  # Get the game type from the request, default to 'simple'
    if gameName == 'pong':
        return startPong(request, player, token, gameType)
    elif gameName == 'tron':
        return startTron(request, player, token, gameType)
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
        token = request.COOKIES.get('token')
        user_id = request.COOKIES.get('userId')

        player = get_player(session_key, token, user_id)
        if player == None:
            return JsonResponse({'error': 'Failed to get player'}, status=400)
        
        game = Game.objects.get(id=game_id)  # Get the game
        if not game.gameProperty.players.get(player=player):
            return JsonResponse({'error': 'Player not in game'}, status=400)
        
        # p = game.gameProperty.players.get(player=player).n
        # print(p)
        
        # players = cache.get('players')
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
    except Player.DoesNotExist:
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
        game_id = request.GET.get('GameId')
        if not user_id:
            return JsonResponse({'error': 'Missing id'}, status=400)
        
        if not User.objects.filter(id=user_id).exists():
            return JsonResponse({'error': 'Player not found'}, status=404)
        
        if game_id:
            game = Game.objects.filter(id=game_id).first()
            ret = []
            ret.append(game.gameName)
            game = game.gameProperty
            for p in game.players.all():
                info = {}
                info['id'] = p.player.id
                info['name'] = p.player.username
                info['score'] = p.score
                ret.append(info)
            return JsonResponse(ret, safe=False)

        # history = GameHistory.objects.filter(player_id=user_id)

        history_list = []
        games = Game.objects.filter(players__id=user_id).order_by('start_date')
        for game in games: # TODO : add if win and score ?
            game_dict = model_to_dict(game)
            game_dict.pop('players')
            game_dict.pop('content_type')
            game_dict.pop('object_id')
            history_list.append(game_dict)
        return JsonResponse(history_list, safe=False)
    
    except Exception as e:
        print(e, flush=True)
        return JsonResponse({'error': 'Error'}, status=500)
