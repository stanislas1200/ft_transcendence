import curses
import time
import requests
import asyncio
import websockets
import ssl
import json
from requests.packages.urllib3.exceptions import InsecureRequestWarning

# Suppress only the single InsecureRequestWarning from urllib3 needed
requests.packages.urllib3.disable_warnings(InsecureRequestWarning)

# Constants
PADDLE_HEIGHT = 4
PADDLE_WIDTH = 1
BALL_SIZE = 1
SCREEN_HEIGHT = 30
SCREEN_WIDTH = 80

# Initialize game state
game_state = {
    'paddle1_y': SCREEN_HEIGHT // 2 - PADDLE_HEIGHT // 2,
    'paddle2_y': SCREEN_HEIGHT // 2 - PADDLE_HEIGHT // 2,
    'ball_x': SCREEN_WIDTH // 2,
    'ball_y': SCREEN_HEIGHT // 2,
    'score1': 0,
    'score2': 0
}

session = requests.Session()

def login(username, password):
    url = 'https://localhost:8000/login'
    data = {'username': username, 'password': password}
    response = session.post(url, data=data, verify=False)
    if response.status_code == 201:
        return response.json()
    else:
        print('Failed to login:', response.status_code)
        return None

def join_game():
    url = 'https://localhost:8001/game/join?gameName=pong'
    response = session.post(url, verify=False)
    if response.status_code == 200:
        return response.json()
    else:
        print('Failed to join game:', response.status_code)
        return None

async def connect_to_websocket(party_id, user_id, game_state):
    global websocket
    uri = f'wss://localhost:8001/ws/pong/{party_id}/{user_id}'
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    cookies = session.cookies.get_dict()
    cookie_header = '; '.join([f'{name}={value}' for name, value in cookies.items()])

    headers = {'Cookie': cookie_header}

    try:
        async with websockets.connect(uri, ssl=ssl_context, extra_headers=headers) as websocket:
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                if 'x' in data:
                    game_state['ball_x'] = int(data['x'] * SCREEN_WIDTH / 800)
                    game_state['ball_y'] = int(data['y'] * SCREEN_HEIGHT / 600)
                    game_state['paddle1_y'] = int(data['positions'][0] * SCREEN_HEIGHT / 600)
                    game_state['paddle2_y'] = int(data['positions'][1] * SCREEN_HEIGHT / 600)
                    game_state['score1'] = data['scores'][0]
                    game_state['score2'] = data['scores'][1]
    except websockets.exceptions.ConnectionClosedOK:
        print('Connection closed')
    except websockets.exceptions.ConnectionClosedError:
        print('Connection closed with error')
    except websockets.exceptions.WebSocketException as e:
        print('WebSocket exception:', e)

def draw_paddle(win, y, x):
    for i in range(PADDLE_HEIGHT):
        win.addch(int(y + i - PADDLE_HEIGHT/2), x, '█')

def draw_ball(win, y, x):
    if 0 <= y < SCREEN_HEIGHT and 0 <= x < SCREEN_WIDTH:
        win.addch(y, x, 'O')

def get_user_input(win, prompt_string):
    curses.echo()
    win.addstr(prompt_string)
    win.refresh()
    input_str = win.getstr().decode('utf-8')
    curses.noecho()
    return input_str

async def main(stdscr):
    global websocket
    websocket = None
    win = curses.newwin(SCREEN_HEIGHT, SCREEN_WIDTH, 0, 0)

    login_response = None
    while not login_response:
        username = get_user_input(win, 'Enter your username: ')
        password = get_user_input(win, 'Enter your password: ')
        login_response = login(username, password)
        if not login_response:
            win.erase()
            win.addstr(0, 0, 'Invalid username or password. Please try again.')
            win.refresh()
            time.sleep(2)
            win.erase()

    join_response = join_game()
    if not join_response:
        return

    party_id = join_response['game_id']
    user_id = session.cookies.get('userId')

    asyncio.create_task(connect_to_websocket(party_id, user_id, game_state))

    curses.curs_set(0)
    win.nodelay(1)
    win.timeout(0)  # Reduce timeout for more responsive input handling
    win.keypad(True)

    while True:
        win.erase()
        win.border(0)

        # Draw paddles and ball
        draw_paddle(win, game_state['paddle1_y'], 3)
        draw_paddle(win, game_state['paddle2_y'], SCREEN_WIDTH - 4)
        draw_ball(win, game_state['ball_y'], game_state['ball_x'])

        # Draw score
        win.addstr(0, SCREEN_WIDTH // 2 - 1, f"{game_state['score1']} - {game_state['score2']}")

        key = win.getch()
        if websocket:
            if key in [curses.KEY_UP, ord('w')]:
                await websocket.send(json.dumps({'direction': 'up'}))
            elif key in [curses.KEY_DOWN, ord('s')]:
                await websocket.send(json.dumps({'direction': 'down'}))

        win.refresh()
        await asyncio.sleep(0.01)  # Reduce sleep duration for more responsive updates

if __name__ == "__main__":
    curses.wrapper(lambda stdscr: asyncio.run(main(stdscr)))