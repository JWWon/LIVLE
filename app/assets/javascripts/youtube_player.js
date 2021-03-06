document.addEventListener("turbolinks:load", function(event) {
    // youtube api
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function() {
        ///////////////////////////////////
        //             partial           //
        ///////////////////////////////////
        $('.show-video-container-js').each(function() {
            var id = $(this).data("playerId");
            var player = new YT.Player('youtube-player-' + id, {
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onPlaybackQualityChange': onPlaybackQualityChange
                }
            });
            player.device = 'partial';
            player.id = id;
            player.autoplay = $(this).data('autoplay');
            player.container = $(this);
            player.playButton = $(this).find('.play-button');
            player.qualityButton = $(this).find('.hd-button');
            // player.fullScreenButton = $(this).find('.fullscreen-button');
            player.filter = $(this).find('.youtube-player-filter');
            player.remainingTimer = $(this).find('.remaining-timer');
            player.progressBar = $(this).find('#progress-bar-' + id);
            player.progressLeft = $(this).find('#progress-left');
            player.progressRight = $(this).find('#progress-right');
            player.isMain = $(this).data('main-video');
            if (player.progressBar.length) {
                player.progressBarController = new ProgressBar.Circle('#progress-bar-' + id, {
                    strokeWidth: 4,
                    easing: 'easeInOut',
                    color: '#9BFFCC',
                    trailColor: 'rgba(256, 256, 256, 0.33)',
                    trailWidth: 4,
                    svgStyle: null
                });
            }
            players.push(player);
        });
        ////////////////////////////////////
        //        official desktop        //
        ////////////////////////////////////
        $('.official-video-container').each(function() {
            var id = $(this).data("playerId");
            var player = new YT.Player('youtube-player-' + id, {
               events: {
                   'onReady': onPlayerReady
               }
            });
            player.device = 'official_desktop';
            player.id = id;
            players.push(player);
        });

        currentPlayer = players[0];
    };
});

var players = [];
var readyPlayerSize = 0;

// on each player ready
function onPlayerReady(event) {
    player = event.target;
    var videoSize;

    if (player.device === 'partial') {
        videoSize = $('.show-video-container-js').length;
        updateTimerDisplay(player);
        if (player.progressBar.length) {
            updateProgressBar(player);
        }
        if (player.autoplay) {
            player.playVideo();
        }
    } else {
        videoSize = $('.official-video-container').length;
    }

    readyPlayerSize++;
    if (readyPlayerSize === videoSize) {
        onAllPlayerReady();
    }
}

function updateTimerDisplay(player){
    // Update current time text display.
    checkTime = setInterval(function () {
        player.remainingTimer.text(formatTime( player.getDuration() - player.getCurrentTime() ));
    }, 500);
}
function formatTime(time){
    time = Math.round(time);
    var minutes = Math.floor(time / 60),
        seconds = time - minutes * 60;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return minutes + ":" + seconds;
}
function updateProgressBar(player){
    updateProgress = setInterval(function () {
        player.progressBarController.set((player.getCurrentTime() / player.getDuration()));
    }, 200);
}

// set change of play button image'
function onPlayerStateChange(event) {
    var player = event.target;
    if (event.data === YT.PlayerState.PLAYING) {
        player.playButton.attr('src', "/icon_pause.png");
        hideFilter(player);
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.BUFFERING || event.data === YT.PlayerState.CUED) {
        player.playButton.attr('src', "/icon_play.png");
    }
}

// change the color of HD button when the video quality change
function onPlaybackQualityChange(event) {
    var player = event.target;
    var quality = player.getPlaybackQuality();
    var qualityButton = player.qualityButton;
    if (quality === 'hd720' || quality === 'hd1080' || quality === 'highres') {
        qualityButton.addClass('_white').removeClass('_light-gray');
    } else {
        qualityButton.addClass('_light-gray').removeClass('_white');
    }
}

// after all players are ready - set click listeners
// TODO: how to move these methods into onPlayerReady()
function onAllPlayerReady() {
    var lastTouchEnd = 0;
    var delayTime = 300;
    players.forEach(function(player){
        if (player.device === 'partial') {
            player.playButton.on("click", function() {
                onClickPlayButton(player);
            });
            player.progressLeft.on('touchend', function (e) {
                var now = Date.now(); //현재시각
                if (now - lastTouchEnd <= delayTime) {
                    e.preventDefault(); //prevent zoomIn
                    onDoubleTabProgress(player, 'left');
                }
                lastTouchEnd = now; //update lastTouchEnd
            });
            player.progressRight.on('touchend', function (e) {
                var now = Date.now(); //현재시각
                if (now - lastTouchEnd <= delayTime) {
                    e.preventDefault(); //prevent zoomIn
                    onDoubleTabProgress(player, 'right');
                }
                lastTouchEnd = now; //update lastTouchEnd
            });
            player.container.on('click', function (e) {
                onClickContainer(player); //filter event
            });
            player.qualityButton.on("click", function() {
                onClickQualityButton(player);
            });
            // player.fullScreenButton.on("click", function() {
            //     onClickFullscreenButton(player);
            // });
        } else {
            $('#prev-button-'+player.id).on('click', function () {
                player.pauseVideo();
            });
            $('#next-button-'+player.id).on('click', function () {
                player.pauseVideo();
            });
        }
    });

    // set onclick lineup buttons
    $('.artist-profile').each(function(index, lineupButton) {
        $(lineupButton).on("click", function() {
            onClickLineupButton($(this));
        });
    });
}

// on click play button
function onClickPlayButton(player) {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
    }
}

// on dblclick progress time
var lt, rt, isAnimation = false;
function onDoubleTabProgress(player, dir) {
    var curTime = player.getCurrentTime();
    var arrow_num = 2;

    player.seekTo(dir === 'left' ? curTime - 10 : curTime + 10);
    getSkipTime(dir);
    for(var i = 1; i <= arrow_num; i++) {
        animateArrow(i, dir);
    }
}
function animateArrow(i, dir) {
    if (dir === 'left') $arrow = $('.arrow-left-'+i);
    else $arrow = $('.arrow-right-'+i);

    $arrow.stop(true, true).animate({'opacity': 0}, 100*(i-1)).
    animate({'opacity': 1}, 400).animate({'opacity': 0}, 400);

}
function getSkipTime(dir) {
    var $time, $timer;
    if (dir === 'left') {
        $time = $('.left-skip-time');
        $timer = $('.left-skip-timer');
        window.clearTimeout(lt);
    } else {
        $time = $('.right-skip-time');
        $timer = $('.right-skip-timer');
        window.clearTimeout(rt);
    }

    if (isAnimation) {
        current_skip_time = $time.html()*1 + 10;
        $time.text(current_skip_time);
    } else {
        $time.text(10);
    }

    isAnimation = true;
    $timer.stop(true, true).animate({'opacity': 1}, 50)
        .delay(750).animate({'opacity': 0}, 200);
    if (dir === 'left') lt = window.setTimeout(function () {
        isAnimation = false;
        $time.text(10);
    }, 1500);
    else rt = window.setTimeout(function () {
        isAnimation = false;
        $time.text(10);
    }, 1500);
}

// on click quality button
function onClickQualityButton(player) {
    var quality = player.getPlaybackQuality();
    if (quality === 'small' || quality === 'medium' || quality === 'large') {
        player.setPlaybackQuality('hd720');
    } else {
        player.setPlaybackQuality('medium');
    }
}

// on click fullscreen button
// function onClickFullscreenButton(player) {
//     var iframeTag = player.a;
//     var requestFullScreen = iframeTag.requestFullScreen || iframeTag.webkitRequestFullScreen ||
//         iframeTag.msRequestFullScreen || iframeTag.mozRequestFullScreen;
//     if (requestFullScreen) {
//         requestFullScreen.bind(iframeTag)();
//     }
// }

// on click container show filter, buttons, progress-bar, timer
function onClickContainer(player) {
    if (player.filter.is(':visible') === true &&
        event.target != player.playButton[0] &&
        event.target != player.qualityButton[0]) {
        hideFilter(player);
    } else {
        showFilter(player);
    }
}

function showFilter(player) {
    player.filter.show();
    player.playButton.show();
    if (player.progressBar) {
        player.progressBar.show();
    }
    player.remainingTimer.show();
    player.qualityButton.show();
    // player.fullScreenButton.show();
}
function hideFilter(player) {
    player.filter.hide();
    player.playButton.hide();
    if (player.progressBar) {
        player.progressBar.hide();
    }
    player.remainingTimer.hide();
    player.qualityButton.hide();
    // player.fullScreenButton.hide();
}

var currentPlayer;
// on click lineup button(profile)
function onClickLineupButton(lineupButton) {
    var buttonId = $(lineupButton).data("buttonId");
    var targetPlayer = players.filter(function(player) {
        return player.id == buttonId;
    })[0];
    var currentContainer = currentPlayer.container;
    var targetContainer = targetPlayer.container;
    var likeTrue = $(targetContainer).data("likeTrue");
    switchVideoDisplay(targetContainer, currentContainer);
    switchVideoStatus(targetPlayer);
    switchLikebuttonColor(likeTrue);
    if (targetPlayer.isMain) {
      $('#video-like-button').addClass('_display-none');
    }
    else {
      switchLikebuttonUrl(targetContainer);
    }
    currentPlayer = targetPlayer;
}

function switchVideoDisplay(targetContainer, currentContainer) {
    $(currentContainer).addClass("_display-none");
    $(targetContainer).removeClass("_display-none");
}
function switchVideoStatus(targetPlayer) {
    currentPlayer.pauseVideo();
    targetPlayer.playVideo();
}
function switchLikebuttonColor(likeTrue) {
    if (likeTrue) {
        $('#icon-like-filled').removeClass('_display-none');
        $('#icon-like-empty').addClass('_display-none');
    } else {
        $('#icon-like-filled').addClass('_display-none');
        $('#icon-like-empty').removeClass('_display-none');
    }
}
function switchLikebuttonUrl(targetContainer) {
    var player_id = targetContainer.data("playerId");
    $('#video-like-button').removeClass('_display-none');
    $('#video-like-button').attr("href", "/feeds/toggle_like/" + player_id);
}
