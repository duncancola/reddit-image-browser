var App = (function () {

  var $container,
      index = 0,
      storedAfter,
      stackSpeed = 5000,
      imageSpeed = 5000,
      transitionSpeed = 2000,
      isAutoSlide = false,
      maxStackSize = 100,
      stack = [];

  var showImages = function (r) {
    $container = $(".img-container");
    $container.css("height", window.innerHeight);
    loadR(r, function (posts, after) {
      storedAfter = after;
      stack = stack.concat(posts);
      appendImages(posts);
      $container.children("img").first().fadeIn(transitionSpeed);
      // show first image
      setSidebarMetadata(stack[index].data);
      index++;
    });
    setupEvents();
    buildStack(r);
  };

  var appendImages = function (posts) {
    _.each(posts, function (post) {
      var $img = makeImage(post);
      $img.appendTo($container);
      var $thumb = $("<img>").attr("src", post.data.thumbnail);
      var $li = $("<li>").append($thumb);
      $(".thumbnails").append($li);
    });
  };

  var setupEvents = function () {
    // change auto-slideshow
    $("input[type=checkbox][name=auto-slideshow]").change(function () {
      isAutoSlide = $(this).is(":checked");
      autoLoadImage();
    });
    //click next: goto next image
    
    // change speed of slideshow
    $(".stackSpeed input[type=range]").on("change", function (e) {
      imageSpeed = parseInt(this.value, 10) * 1000;
      $(".appInfo").find(".speed").text(imageSpeed);
    });
    // window resize, scale the height
    $(window).resize(function () {
      $container.css("height", window.innerHeight);
    });
  };

  var buildStack = function (r) {
    _.delay(function () {
      if (stack.length < index + 5) {
        loadR(r, function (posts, after) {
          storedAfter = after;
          stack = stack.concat(posts);
          appendImages(posts);
          $(".sidebar").find(".appInfo").find(".index").text(index);
          $(".sidebar").find(".appInfo").find(".stack").text(stack.length);
        }, storedAfter);
      }
      buildStack(r);
    }, stackSpeed);
  };

  var print = function (stack) {
    console.log(_.map(stack, function (v) {
      return v.data.url;
    }), index);
  };

  var makeImage = function (post) {
    return $("<img>").attr("src", post.data.url + ".jpg").addClass("main").hide();
  };

  var gotoNextImage = function () {
    var $prev = $container.find("img").first();
    var $next = $prev.next();
    var current = stack[index];
    $prev.fadeOut(transitionSpeed, function () {
      $(this).remove();
      
    });
    $next.fadeIn(transitionSpeed);
    setSidebarMetadata(current.data);
    console.log("index=", index, "current", current, "stack:", stack);
    index++;
  };

/* OLD
  var gotoNextImage = function () {
    var $prev = $container.find("img");
    if ($prev.length > 0) {
      $prev.fadeOut("slow", function () {
        $(this).remove();
      });
    }
    var current = stack[index];
    setSidebarMetadata(current.data);
    var $img = makeImage(current);
    $img.appendTo($container).fadeIn("slow", autoLoadImage);
  };
*/

  var autoLoadImage = function () {
    _.delay(function () {
      if (isAutoSlide) {
        console.log("autoLoadImage... ACTIVATE");
        gotoNextImage();
        autoLoadImage();
      }
    }, imageSpeed);
  };

  var setSidebarMetadata = function (img) {
    console.log("image", index);
    var redditUrl = "http://www.reddit.com";
    var $link = $("<a>").attr({
      "href": redditUrl + img.permalink,
      "target": "_blank"
    }).text(img.title);
    $(".sidebar").find(".title").html("").append($link);
    $(".sidebar").find(".time").text(new Date(img.created_utc * 1000));
    $(".sidebar").find(".appInfo").find(".index").text(index + 1);
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
