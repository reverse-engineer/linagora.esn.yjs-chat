'use strict';

angular.module('esn.chat')
  .constant('CHAT_AVATAR_SIZE', 48)
  .constant('CHAT_WINDOW_SIZE', { width: 300, height: 300 })
  .constant('CHAT_POPOVER_DELAY', { show: 100, hide: 200 })
  .constant('DEFAULT_AVATAR', '/images/avatar/default.png')
  .constant('CHAT_HIDE_TIMEOUT', 4000);
