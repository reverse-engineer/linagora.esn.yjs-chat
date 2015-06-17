# message structure

{
    author: String, // easyrtcid of message emitter
    authorAvatar: String, // base64 encoded image of user avatar. Can be the cam screenshot, or null
    published: number, // JS timesamp
    message: String, // message
}


# Events

chat:message:received (chatMessage)
chat:message:sent (chatMessage)
chat:window:visibility ( {visible:boolean} )

# Constants

CHAT_AVATAR_SIZE: Size of an avatar's edge. Exemple: CHAT_AVATAR_SIZE=48

# Services

## chatMessage

chat object type constructor. It's a function with the following signature:

"message signature" (String author, String authorAvatar, number published, String message)

that sends back an object like "message structure"

## yArraySynchronizer

javascript array synchronizer with YJS list. It's a function, with the following signature:

YList (Array jsArray)

It sends back a yjs YList (https://github.com/y-js/y-list/blob/master/lib/y-list.coffee).
This list will be synchronized with the jsArray by using YList.observe method.

**Injects** yjsService

## chat

chat service

Properties:

yMessages: // YJS messages data structure
messages: // JS array that is synchronized using Y
opened: boolean // tells whether the chat window is visible
unread: number // the count of unread messages

Méthods:

**sendMessage ( Object chatMessage )**
This method calls yMessages.push(chatMessage) and then broadcast a chat:message:sent message (data: chatMessage)

**toggleWindow ()**
This method takes care of updating the opened property, and if needed, the unread property. It then broadcast the chat:window:visibility event

**initialisation code**
On the creation of the service, it creates the messages property, then the yMessages property, then observes the yMessages property, so then it broadcast a 
chat:message:received event (data: chatMessage) when a new message is added to the list (either local or remote message, we don't care).
It also has the responsibility of initializing the Y thing (using connector.whenSynced, see with Corentin for the gory details).


**injects** $rootScope, yjsService, yArraySynchronizer


## localCameraScreenshot

methods:

**shoot (number screenshotEdgePx)**
This method send back a square screenshot, of screenshotEdgePx pixel edge, of the local camera. If local camera is desactivated, sends back null.

# Directives

## chatWindow

displays the chat window, expose the chat.messages array, implements the forEach of chat.messages and instanciates chatMessageDisplay. Instanciate chatMessageEditor. Listen chat:window:visibility, disappears when visibility=false, appears when visibility=true (idempotent).

**injects** chat

## chatMessageDisplay

displays a chatMessage. Isolate scope. Scope attribute: chatMessage, that is a chatMessage.
This directive formats the message in the chat window. This directive (or a sub directive) is smart enough, to display chatMessage.authorAvatar when defined, and the generic avatar (penguin + good associated color).

**injects** currentConferenceState

## chatMessageEditor

displays the input:text message editor, as well as the send button. When a message is sent either by hitting the [enter] key, either by clicking the send button, the directive creates a chatMessage object and calls chat.sendMessage()

**injects** localCameraScreenshot, chatMessage, CHAT_AVATAR_SIZE

## chatMessageBubble

is instanciated in attendees thumbails. Listen to the chat:message:received event. When the chat:message:received message.author matches the easyrtc id of the associated thumbail, and if the chat window is not opened, it displays a bubble with the message contents.

**injects** chat


## chatIcon

displays the chat window togglin button, as well as the unread messages count, as a badge, when count is nul null, and the chat window is not opened.

**injects** $rootScope, chat
