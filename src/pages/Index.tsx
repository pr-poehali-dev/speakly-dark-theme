import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type ChatType = 'personal' | 'group' | 'channel';

type Chat = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: ChatType;
  online?: boolean;
  messages?: Message[];
};

type Message = {
  id: string;
  text: string;
  time: string;
  isMine: boolean;
  reactions?: string[];
  replyTo?: string;
  type?: 'text' | 'voice' | 'image' | 'sticker';
};

type Gift = {
  id: string;
  name: string;
  price: number;
  emoji: string;
};

type Screen = 'auth' | 'chats' | 'chat' | 'profile' | 'settings' | 'shop' | 'music' | 'wallet';

const Index = () => {
  const [screen, setScreen] = useState<Screen>('auth');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [chats, setChats] = useState<Chat[]>([
    {
      id: '1',
      name: 'Анна',
      avatar: '👩',
      lastMessage: 'Привет! Как дела?',
      time: '14:23',
      unread: 2,
      type: 'personal',
      online: true,
      messages: [
        { id: '1', text: 'Привет!', time: '14:20', isMine: false },
        { id: '2', text: 'Привет! Как дела?', time: '14:23', isMine: false },
      ]
    },
    {
      id: '2',
      name: 'Рабочая группа',
      avatar: '💼',
      lastMessage: 'Встреча завтра в 10:00',
      time: '13:45',
      unread: 5,
      type: 'group',
      messages: []
    },
    {
      id: '3',
      name: 'Новости IT',
      avatar: '📱',
      lastMessage: 'Новый релиз React 19',
      time: '12:10',
      unread: 0,
      type: 'channel',
      messages: []
    },
  ]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [createChatDialog, setCreateChatDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [newChatType, setNewChatType] = useState<ChatType>('personal');
  const [racoonBalance, setRacoonBalance] = useState(150);
  const [ghostMode, setGhostMode] = useState(false);
  const [userName, setUserName] = useState('Вы');
  const [userBio, setUserBio] = useState('Онлайн');
  const [editProfile, setEditProfile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const gifts: Gift[] = [
    { id: '1', name: 'Роза', price: 50, emoji: '🌹' },
    { id: '2', name: 'Торт', price: 100, emoji: '🎂' },
    { id: '3', name: 'Подарок', price: 200, emoji: '🎁' },
    { id: '4', name: 'Корона', price: 500, emoji: '👑' },
  ];

  const emojis = ['😀', '😂', '❤️', '👍', '🔥', '🎉', '😍', '🙌'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleAuth = () => {
    if (step === 'phone') {
      if (phoneNumber.length < 10) {
        toast.error('Введите корректный номер');
        return;
      }
      setStep('code');
      toast.success('Код отправлен на номер');
    } else {
      if (verificationCode.length !== 4) {
        toast.error('Введите 4-значный код');
        return;
      }
      setScreen('chats');
      toast.success('Добро пожаловать в Speakly!');
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      isMine: true,
      replyTo: replyingTo?.text,
    };

    setChats(chats.map(chat =>
      chat.id === activeChat.id
        ? { ...chat, messages: [...(chat.messages || []), newMessage] }
        : chat
    ));

    setActiveChat({
      ...activeChat,
      messages: [...(activeChat.messages || []), newMessage]
    });

    setMessageText('');
    setReplyingTo(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!activeChat) return;

    const updatedMessages = activeChat.messages?.map(msg =>
      msg.id === messageId
        ? { ...msg, reactions: [...(msg.reactions || []), emoji] }
        : msg
    );

    setActiveChat({ ...activeChat, messages: updatedMessages });
    setChats(chats.map(chat =>
      chat.id === activeChat.id ? { ...chat, messages: updatedMessages } : chat
    ));
  };

  const createNewChat = () => {
    if (!newChatName.trim()) return;

    const newChat: Chat = {
      id: Date.now().toString(),
      name: newChatName,
      avatar: newChatType === 'personal' ? '👤' : newChatType === 'group' ? '👥' : '📢',
      lastMessage: 'Чат создан',
      time: new Date().toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }),
      unread: 0,
      type: newChatType,
      messages: []
    };

    setChats([newChat, ...chats]);
    setCreateChatDialog(false);
    setNewChatName('');
    toast.success(`${newChatType === 'personal' ? 'Чат' : newChatType === 'group' ? 'Группа' : 'Канал'} создан`);
  };

  const buyGift = (gift: Gift) => {
    if (racoonBalance >= gift.price) {
      setRacoonBalance(racoonBalance - gift.price);
      toast.success(`Вы купили ${gift.name} ${gift.emoji}`);
    } else {
      toast.error('Недостаточно енотиков');
    }
  };

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      setScreen('auth');
      setStep('phone');
      setPhoneNumber('');
      setVerificationCode('');
      toast.info('Вы вышли из аккаунта');
    }
  };

  if (screen === 'auth') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">💬</div>
            <h1 className="text-4xl font-bold mb-2">Speakly</h1>
            <p className="text-muted-foreground">Современный мессенджер</p>
          </div>

          <div className="bg-card rounded-2xl p-6 space-y-4">
            {step === 'phone' ? (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Номер телефона</label>
                  <Input
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="bg-secondary border-0"
                  />
                </div>
                <Button onClick={handleAuth} className="w-full" size="lg">
                  Получить код
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Код подтверждения</label>
                  <Input
                    type="text"
                    placeholder="____"
                    maxLength={4}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="bg-secondary border-0 text-center text-2xl tracking-widest"
                  />
                </div>
                <Button onClick={handleAuth} className="w-full" size="lg">
                  Войти
                </Button>
                <Button variant="ghost" onClick={() => setStep('phone')} className="w-full">
                  Изменить номер
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'chats') {
    return (
      <div className="min-h-screen bg-background flex">
        <div className="w-full max-w-md mx-auto flex flex-col">
          <div className="bg-card border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setScreen('profile')}>
                <Avatar className="w-10 h-10">
                  <AvatarFallback>👤</AvatarFallback>
                </Avatar>
              </Button>
              <h1 className="text-xl font-semibold">Speakly</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setScreen('shop')}>
                <Icon name="Gift" size={20} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCreateChatDialog(true)}>
                <Icon name="Plus" size={20} />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => { setActiveChat(chat); setScreen('chat'); }}
                  className="w-full p-3 hover:bg-accent rounded-xl transition-colors flex items-center gap-3"
                >
                  <div className="relative">
                    <div className="text-4xl">{chat.avatar}</div>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{chat.name}</span>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5 font-medium">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="bg-card border-t border-border p-2 flex justify-around">
            <Button variant="ghost" size="icon" onClick={() => setScreen('chats')} className="text-primary">
              <Icon name="MessageCircle" size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setScreen('music')}>
              <Icon name="Music" size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setScreen('wallet')}>
              <Icon name="Wallet" size={24} />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setScreen('settings')}>
              <Icon name="Settings" size={24} />
            </Button>
          </div>
        </div>

        <Dialog open={createChatDialog} onOpenChange={setCreateChatDialog}>
          <DialogContent className="bg-card">
            <DialogHeader>
              <DialogTitle>Создать</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={newChatType === 'personal' ? 'default' : 'outline'}
                  onClick={() => setNewChatType('personal')}
                  className="flex-1"
                >
                  Чат
                </Button>
                <Button
                  variant={newChatType === 'group' ? 'default' : 'outline'}
                  onClick={() => setNewChatType('group')}
                  className="flex-1"
                >
                  Группа
                </Button>
                <Button
                  variant={newChatType === 'channel' ? 'default' : 'outline'}
                  onClick={() => setNewChatType('channel')}
                  className="flex-1"
                >
                  Канал
                </Button>
              </div>
              <Input
                placeholder="Название"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                className="bg-secondary border-0"
              />
              <Button onClick={createNewChat} className="w-full">
                Создать
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (screen === 'chat' && activeChat) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="bg-card border-b border-border p-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setScreen('chats')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div className="text-4xl">{activeChat.avatar}</div>
          <div className="flex-1">
            <h2 className="font-semibold">{activeChat.name}</h2>
            <p className="text-xs text-muted-foreground">
              {activeChat.online && !ghostMode ? 'онлайн' : 'был(а) недавно'}
            </p>
          </div>
          <Button variant="ghost" size="icon">
            <Icon name="MoreVertical" size={20} />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-2xl mx-auto">
            {activeChat.messages?.map((message) => (
              <div key={message.id} className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[70%]">
                  {message.replyTo && (
                    <div className="bg-muted/50 rounded-lg p-2 mb-1 text-xs border-l-2 border-primary">
                      {message.replyTo}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl p-3 ${
                      message.isMine ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs opacity-70">{message.time}</span>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex gap-1">
                          {message.reactions.slice(0, 3).map((emoji, i) => (
                            <span key={i} className="text-xs">{emoji}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(message)}
                      className="h-6 px-2 text-xs"
                    >
                      <Icon name="Reply" size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(message.id, '❤️')}
                      className="h-6 px-2 text-xs"
                    >
                      ❤️
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="bg-card border-t border-border p-4">
          {replyingTo && (
            <div className="bg-muted rounded-lg p-2 mb-2 flex items-center justify-between">
              <div className="text-sm truncate">{replyingTo.text}</div>
              <Button variant="ghost" size="icon" onClick={() => setReplyingTo(null)} className="h-6 w-6">
                <Icon name="X" size={14} />
              </Button>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <Button variant="ghost" size="icon">
              <Icon name="Paperclip" size={20} />
            </Button>
            <div className="flex-1">
              <Input
                placeholder="Сообщение..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="bg-secondary border-0"
              />
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <Icon name="Smile" size={20} />
            </Button>
            <Button size="icon" onClick={handleSendMessage}>
              <Icon name="Send" size={20} />
            </Button>
          </div>
          {showEmojiPicker && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { setMessageText(messageText + emoji); setShowEmojiPicker(false); }}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'profile') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-b border-border p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setScreen('chats')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Профиль</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-4xl">👤</AvatarFallback>
              </Avatar>
              {editProfile ? (
                <div className="w-full space-y-3">
                  <Input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="bg-secondary border-0"
                    placeholder="Имя"
                  />
                  <Input
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    className="bg-secondary border-0"
                    placeholder="О себе"
                  />
                  <Button onClick={() => { setEditProfile(false); toast.success('Профиль обновлен'); }} className="w-full">
                    Сохранить
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{userName}</h2>
                  <p className="text-muted-foreground">{userBio}</p>
                  <Button onClick={() => setEditProfile(true)} variant="outline">
                    Редактировать профиль
                  </Button>
                </>
              )}
            </div>

            <div className="bg-secondary rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span>Енотики 🦝</span>
                <span className="text-racoon font-bold text-xl">{racoonBalance}</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setScreen('wallet')}>
                Пополнить
              </Button>
            </div>

            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start" onClick={() => setScreen('settings')}>
                <Icon name="Settings" size={20} className="mr-3" />
                Настройки
              </Button>
              <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <Icon name="LogOut" size={20} className="mr-3" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'settings') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-b border-border p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setScreen('profile')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Настройки</h1>
          </div>

          <ScrollArea className="h-[calc(100vh-73px)]">
            <div className="p-4 space-y-4">
              <div className="bg-card rounded-xl p-4 space-y-4">
                <h3 className="font-semibold">Конфиденциальность</h3>
                <div className="flex items-center justify-between">
                  <span>Режим призрака</span>
                  <Button
                    variant={ghostMode ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setGhostMode(!ghostMode); toast.success(ghostMode ? 'Режим призрака выключен' : 'Режим призрака включен'); }}
                  >
                    {ghostMode ? 'Вкл' : 'Выкл'}
                  </Button>
                </div>
              </div>

              <div className="bg-card rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">Общие</h3>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Globe" size={20} className="mr-3" />
                  Язык
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Palette" size={20} className="mr-3" />
                  Темы
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Bell" size={20} className="mr-3" />
                  Уведомления
                </Button>
              </div>

              <div className="bg-card rounded-xl p-4 space-y-3">
                <h3 className="font-semibold">Другое</h3>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="HelpCircle" size={20} className="mr-3" />
                  Служба поддержки
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="Users" size={20} className="mr-3" />
                  Черный список
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  if (screen === 'shop') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-b border-border p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setScreen('chats')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Магазин подарков</h1>
          </div>

          <div className="p-4">
            <div className="bg-gradient-to-r from-racoon/20 to-primary/20 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-lg">Ваш баланс</span>
                <span className="text-2xl font-bold text-racoon">🦝 {racoonBalance}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {gifts.map((gift) => (
                <div key={gift.id} className="bg-card rounded-xl p-4 space-y-3">
                  <div className="text-6xl text-center">{gift.emoji}</div>
                  <h3 className="font-semibold text-center">{gift.name}</h3>
                  <div className="text-center text-racoon font-bold">🦝 {gift.price}</div>
                  <Button onClick={() => buyGift(gift)} className="w-full" size="sm">
                    Купить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'music') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-b border-border p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setScreen('chats')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Музыка</h1>
          </div>

          <div className="p-4 space-y-4">
            <Input placeholder="Поиск музыки..." className="bg-secondary border-0" />
            
            <div className="space-y-3">
              {['Любимые треки', 'Рок', 'Поп', 'Электроника', 'Рэп'].map((playlist) => (
                <div key={playlist} className="bg-card rounded-xl p-4 flex items-center gap-3 hover:bg-accent cursor-pointer transition-colors">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Icon name="Music" size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{playlist}</h3>
                    <p className="text-sm text-muted-foreground">Плейлист</p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Icon name="Play" size={20} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'wallet') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card border-b border-border p-4 flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setScreen('profile')}>
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-xl font-semibold">Кошелек</h1>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-gradient-to-br from-primary to-racoon rounded-2xl p-6 text-white">
              <p className="text-sm opacity-80 mb-2">Баланс енотиков</p>
              <div className="text-4xl font-bold mb-4">🦝 {racoonBalance}</div>
              <Button variant="secondary" className="w-full">
                Пополнить баланс
              </Button>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Пакеты енотиков</h3>
              {[
                { amount: 100, price: 99 },
                { amount: 500, price: 449 },
                { amount: 1000, price: 799 },
                { amount: 5000, price: 3499 },
              ].map((pack) => (
                <div key={pack.amount} className="bg-card rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">🦝 {pack.amount}</div>
                    <div className="text-sm text-muted-foreground">{pack.price} ₽</div>
                  </div>
                  <Button
                    onClick={() => {
                      setRacoonBalance(racoonBalance + pack.amount);
                      toast.success(`Куплено ${pack.amount} енотиков!`);
                    }}
                  >
                    Купить
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;