var App = (function () {

  var $container,
      index = 0,
      storedAfter,
      stackSpeed = 5000,
      imageSpeed = 5000,
      stack = [];

  var showImages = function (r) {
    $container = $(".img-container");
    loadR(r, function (posts, after) {
      storedAfter = after;
      stack = stack.concat(posts);
      next();
    });
    events();
    reload(r);
  };

  var events = function () {
    document.querySelector(".stackSpeed input[type=range]").addEventListener("change", function (e) {
      imageSpeed = parseInt(this.value, 10) * 1000;
      $(".appInfo").find(".speed").text(imageSpeed);
    });
  };

  var reload = function (r) {
    _.delay(function () {
      if (stack.length < index + 5) {
        loadR(r, function (posts, after) {
          storedAfter = after;
          stack = stack.concat(posts);
          $(".sidebar").find(".appInfo").find(".index").text(index);
          $(".sidebar").find(".appInfo").find(".stack").text(stack.length);
          //print(posts);
          //print(stack);
        }, storedAfter);
      }
      reload(r);
    }, stackSpeed);
  };

  var print = function (stack) {
    console.log(_.map(stack, function (v) {
      return v.data.url;
    }), index);
  };

  var makeImage = function (post) {
    return $("<img>").attr("src", post.data.url + ".jpg").hide();
  };

  var next = function () {
    var $prev = $container.find("img");
    if ($prev.length > 0) {
      $prev.fadeOut("slow", function () {
        $(this).remove();
      });
    }
    var current = stack[index];
    setSidebarMetadata(current.data);
    var $img = makeImage(current);
    $img.appendTo($container).fadeIn("slow", function () {
      _.delay(function () {
        index++;
        next();
      }, imageSpeed);
    });
  };

  var setSidebarMetadata = function (img) {
    var redditUrl = "http://www.reddit.com";
    var $link = $("<a>").attr("href", redditUrl + img.permalink).text(img.title)
    $(".sidebar").find(".title").html("").append($link);
    $(".sidebar").find(".time").text(new Date(img.created_utc * 1000));
    $(".sidebar").find(".appInfo").find(".index").text(index);
    $(".sidebar").find(".appInfo").find(".stack").text(stack.length);
  };

  var filter = function (response) {
    return response.filter(function (post) {
      return post.data.domain === "imgur.com";
    });
  };

  var loadR = function (name, success, after) {
    var data = after ? {after: after} : undefined;
    var url = "http://www.reddit.com/r/" + name + "/.json";
    $.ajax({
      url: url,
      dataType: "jsonp",
      jsonp: "jsonp",
      data: data,
      success: function (response) {
        success.call(this, filter(response.data.children), response.data.after);
      },
      error: function () {
        console.error("Error, maybe have auto/manual try again here?");
      }
    });
  };

  return {
    begin: showImages
  };

})();
