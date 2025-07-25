import socketio
import threading
import time

ROOM = '35I2QH'  # Use a valid room code from your backend

sio1 = socketio.Client()
sio2 = socketio.Client()

def setup_handlers(sio, name):
    @sio.event
    def connect():
        print(f'{name} connected')
        sio.emit('join_room', {'room': ROOM})

    @sio.event
    def disconnect():
        print(f'{name} disconnected')

    @sio.on('user_joined')
    def on_user_joined(data):
        print(f'{name} sees user joined:', data)

    @sio.on('user_left')
    def on_user_left(data):
        print(f'{name} sees user left:', data)

    @sio.on('code_update')
    def on_code_update(data):
        print(f'{name} sees code update:', data)

    @sio.on('chat_message')
    def on_chat_message(data):
        print(f'{name} sees chat message:', data)

setup_handlers(sio1, 'Client1')
setup_handlers(sio2, 'Client2')

def client1_actions():
    sio1.connect('http://localhost:8000')
    time.sleep(1)
    sio1.emit('code_update', {'room': ROOM, 'code': 'print("Hello from Client1!")'})
    time.sleep(1)
    sio1.emit('chat_message', {'room': ROOM, 'message': 'Hi from Client1!'})
    time.sleep(2)
    sio1.emit('leave_room', {'room': ROOM})
    time.sleep(1)
    sio1.disconnect()

def client2_actions():
    sio2.connect('http://localhost:8000')
    time.sleep(2)
    sio2.emit('code_update', {'room': ROOM, 'code': 'print("Hello from Client2!")'})
    time.sleep(1)
    sio2.emit('chat_message', {'room': ROOM, 'message': 'Hi from Client2!'})
    time.sleep(2)
    sio2.emit('leave_room', {'room': ROOM})
    time.sleep(1)
    sio2.disconnect()

thread1 = threading.Thread(target=client1_actions)
thread2 = threading.Thread(target=client2_actions)
thread1.start()
thread2.start()
thread1.join()
thread2.join() 