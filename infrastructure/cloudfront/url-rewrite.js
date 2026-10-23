// CloudFront Function (cloudfront-js-2.0), viewer-request event.
//
// Maps clean URLs onto the objects produced by the Next.js static export
// (trailingSlash: true), because a private S3 origin accessed through OAC does
// not resolve index documents in sub-folders:
//
//   /services      -> 301 redirect to /services/  (query string preserved)
//   /services/     -> /services/index.html
//   /_next/x.js    -> unchanged (has a file extension)
//
// Optional canonical host redirect: set CANONICAL_HOST to e.g.
// "www.example.com" to 301 every other hostname (such as the apex domain)
// to it. Leave empty to disable.
//
// This file is also loaded by scripts/static-server.mjs and unit tests, so the
// exact production logic is exercised locally. Keep it ES5-compatible and
// free of imports/exports (CloudFront Functions requirement).

var CANONICAL_HOST = "";

// Entry point invoked by CloudFront.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var host = request.headers.host ? request.headers.host.value : "";

  if (CANONICAL_HOST && host && host !== CANONICAL_HOST) {
    return redirect("https://" + CANONICAL_HOST + uri + queryString(request.querystring));
  }

  if (uri.charAt(uri.length - 1) === "/") {
    request.uri = uri + "index.html";
    return request;
  }

  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);
  if (lastSegment.indexOf(".") === -1) {
    return redirect(uri + "/" + queryString(request.querystring));
  }

  return request;
}

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: location },
      "cache-control": { value: "public, max-age=3600" },
    },
  };
}

function queryString(qs) {
  var parts = [];
  for (var key in qs) {
    var entry = qs[key];
    if (entry.multiValue) {
      for (var i = 0; i < entry.multiValue.length; i++) {
        parts.push(key + "=" + entry.multiValue[i].value);
      }
    } else {
      parts.push(key + (entry.value === "" ? "" : "=" + entry.value));
    }
  }
  return parts.length ? "?" + parts.join("&") : "";
}
