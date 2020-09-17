// const API_KEY = 'AIzaSyBBdYuKULGXHTKl7nyKbyogNVVwAR2eAoM';
const API_KEY = 'AIzaSyBhZG9W3XlTio_a0aaEeEBHn3li5wAzjS4';
gapi.load("client");

async function loadVideos(listName) {
    console.log('/videos?' + new URLSearchParams({
        list: listName,
    }));
    let videos = await fetch('/videos?' + new URLSearchParams({
        list: listName,
    }));
    videos = await videos.json();
    console.log(videos);
    return videos;
}

function updateVideos(videos, listName) {
    videos = [...new Set(videos)];
    return fetch('/videos?' + new URLSearchParams({
        list: listName,
    }), {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(videos)
    })
}

async function loadClient() {
    gapi.client.setApiKey(API_KEY);
    return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () {
                $("#status").html("<p style=\"color:green\">OKI DOKI</p>");
                console.log("GAPI client loaded for API");
            },
            function (err) {
                $("#status").html("<p style=\"color:red\">PLS REFRESH</p>");
                console.error("Error loading GAPI client for API", err);
            });
}

function shuffle(array) {
    return array.map(function (n) {
        return [Math.random(), n]
    })
        .sort().map(function (n) {
            return n[1]
        });
}

function get_author(thread) {
    return thread.snippet.topLevelComment.snippet.authorDisplayName
}

function get_profile(thread) {
    return thread.snippet.topLevelComment.snippet.authorProfileImageUrl
}

function get_likes(thread) {
    let likes = thread.snippet.topLevelComment.snippet.likeCount;
    if (likes > 10000) {
        likes = parseFloat(likes / 1000).toFixed(0) + 'K'
    } else if (likes > 1000) {
        likes = parseFloat(likes / 1000).toFixed(1) + 'K'
    }
    return likes
}


function time_diff(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.floor(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.floor(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.floor(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.floor(elapsed / msPerYear) + ' years ago';
    }
}

function get_time(thread) {
    let time = new Date(thread.snippet.topLevelComment.snippet.publishedAt);
    return time_diff(new Date(), time);
}

function get_comment(thread) {
    return thread.snippet.topLevelComment.snippet.textOriginal
}

function get_title(video) {
    return video.snippet.title
}

function get_channel(video) {
    return video.snippet.channelTitle
}

function get_thumbnail(video) {
    let thumbs = video.snippet.thumbnails;
    if (thumbs.maxres) {
        return video.snippet.thumbnails.maxres.url
    } else {
        return video.snippet.thumbnails.high.url
    }
}

function get_video(videoId) {
    return gapi.client.youtube.videos.list({
        "part": [
            "snippet"
        ],
        "id": videoId
    }).then(response => response.result.items[0])
}

function get_threads(videoId) {
    return gapi.client.youtube.commentThreads.list({
        "part": [
            "snippet"
        ],
        "textFormat": "plainText",
        "order": "relevance",
        "videoId": videoId
    }).then(response => response.result.items)
}

function get_playlist(playlistId, pageToken = "") {
    return gapi.client.youtube.playlistItems.list({
        "part": [
            "id, snippet, contentDetails"
        ],
        "maxResults": 200,
        "pageToken": pageToken,
        "playlistId": playlistId
    }).then(response => {
        let ids = response.result.items.map(item => item.snippet.resourceId.videoId);
        if (response.result.nextPageToken) {
            console.log("DEEPER");
            return get_playlist(playlistId, response.result.nextPageToken).then(list => {
                ids = ids.concat(list);
                return ids
            });
        } else {
            return ids
        }
    })
}
