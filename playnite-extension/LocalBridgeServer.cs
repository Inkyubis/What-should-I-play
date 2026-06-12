using Playnite.SDK;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Web.Script.Serialization;

namespace WhatShouldIPlayBridge
{
    internal sealed class LocalBridgeServer : IDisposable
    {
        internal const int Port = 32145;

        private const int MaximumHeaderBytes = 16384;
        private static readonly ILogger Logger = LogManager.GetLogger();
        private static readonly HashSet<string> AllowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "https://inkyubis.github.io",
            "https://what-should-i-play.netlify.app",
            "http://localhost:4173",
            "http://127.0.0.1:4173"
        };

        private readonly Func<BridgeResponse> libraryProvider;
        private TcpListener listener;
        private Thread listenerThread;
        private volatile bool stopping;

        public LocalBridgeServer(Func<BridgeResponse> libraryProvider)
        {
            this.libraryProvider = libraryProvider ?? throw new ArgumentNullException(nameof(libraryProvider));
        }

        public bool IsRunning => listener != null && !stopping;

        public void Start()
        {
            if (IsRunning)
            {
                return;
            }

            stopping = false;
            listener = new TcpListener(IPAddress.Loopback, Port);
            listener.Start();
            listenerThread = new Thread(Listen)
            {
                IsBackground = true,
                Name = "WhatShouldIPlayBridge"
            };
            listenerThread.Start();
            Logger.Info($"What Should I Play? bridge listening on 127.0.0.1:{Port}.");
        }

        public void Stop()
        {
            stopping = true;

            try
            {
                listener?.Stop();
            }
            catch (Exception exception)
            {
                Logger.Warn(exception, "Failed to stop What Should I Play? bridge listener cleanly.");
            }

            listener = null;
        }

        public void Dispose()
        {
            Stop();
        }

        private void Listen()
        {
            while (!stopping)
            {
                try
                {
                    var client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(_ => HandleClient(client));
                }
                catch (SocketException) when (stopping)
                {
                    return;
                }
                catch (ObjectDisposedException) when (stopping)
                {
                    return;
                }
                catch (Exception exception)
                {
                    Logger.Error(exception, "What Should I Play? bridge failed while accepting a request.");
                }
            }
        }

        private void HandleClient(TcpClient client)
        {
            using (client)
            {
                client.ReceiveTimeout = 5000;
                client.SendTimeout = 5000;

                try
                {
                    using (var stream = client.GetStream())
                    {
                        var request = ReadRequest(stream);
                        if (request == null)
                        {
                            WriteJson(stream, 400, null, new { error = "Invalid request." });
                            return;
                        }

                        var path = request.Path.Split('?')[0].TrimEnd('/');
                        if (string.Equals(request.Method, "GET", StringComparison.OrdinalIgnoreCase) &&
                            string.Equals(path, "/v1/connect", StringComparison.OrdinalIgnoreCase))
                        {
                            var nonce = GetQueryValue(request.Path, "nonce");
                            if (!IsSafeNonce(nonce))
                            {
                                WriteHtml(stream, 400, BuildMessagePage(
                                    "Connection failed",
                                    "The connection request was missing a valid one-time code."));
                                return;
                            }

                            var returnOrigin = GetQueryValue(request.Path, "origin");
                            if (string.IsNullOrWhiteSpace(returnOrigin) || !AllowedOrigins.Contains(returnOrigin))
                            {
                                WriteHtml(stream, 403, BuildMessagePage(
                                    "Connection blocked",
                                    "This website is not allowed to read the Playnite library."));
                                return;
                            }

                            WriteConnectPage(stream, nonce, returnOrigin, libraryProvider());
                            return;
                        }

                        request.Headers.TryGetValue("Origin", out var origin);
                        if (string.IsNullOrWhiteSpace(origin) || !AllowedOrigins.Contains(origin))
                        {
                            WriteJson(stream, 403, null, new { error = "Origin is not allowed." });
                            return;
                        }

                        if (string.Equals(request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase))
                        {
                            WriteResponse(stream, 204, origin, "application/json; charset=utf-8", Array.Empty<byte>());
                            return;
                        }

                        if (!string.Equals(request.Method, "GET", StringComparison.OrdinalIgnoreCase))
                        {
                            WriteJson(stream, 405, origin, new { error = "Only GET requests are supported." });
                            return;
                        }

                        if (string.Equals(path, "/v1/status", StringComparison.OrdinalIgnoreCase))
                        {
                            WriteJson(stream, 200, origin, new
                            {
                                bridge = "What Should I Play? Bridge",
                                version = "0.4.0",
                                ready = true
                            });
                            return;
                        }

                        if (string.Equals(path, "/v1/library", StringComparison.OrdinalIgnoreCase))
                        {
                            WriteJson(stream, 200, origin, libraryProvider());
                            return;
                        }

                        WriteJson(stream, 404, origin, new { error = "Not found." });
                    }
                }
                catch (Exception exception)
                {
                    Logger.Error(exception, "What Should I Play? bridge failed while handling a request.");
                }
            }
        }

        private static BridgeRequest ReadRequest(Stream stream)
        {
            var buffer = new byte[1024];
            var received = new List<byte>();

            while (received.Count < MaximumHeaderBytes)
            {
                var count = stream.Read(buffer, 0, buffer.Length);
                if (count <= 0)
                {
                    return null;
                }

                received.AddRange(buffer.Take(count));
                if (FindHeaderTerminator(received) >= 0)
                {
                    break;
                }
            }

            var headerEnd = FindHeaderTerminator(received);
            if (headerEnd < 0)
            {
                return null;
            }

            var headerText = Encoding.ASCII.GetString(received.Take(headerEnd + 4).ToArray());
            var lines = headerText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            var requestLine = lines[0].Split(' ');
            if (requestLine.Length < 2)
            {
                return null;
            }

            var headers = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            foreach (var line in lines.Skip(1))
            {
                if (string.IsNullOrWhiteSpace(line))
                {
                    break;
                }

                var separator = line.IndexOf(':');
                if (separator <= 0)
                {
                    continue;
                }

                headers[line.Substring(0, separator).Trim()] = line.Substring(separator + 1).Trim();
            }

            return new BridgeRequest
            {
                Method = requestLine[0],
                Path = requestLine[1],
                Headers = headers
            };
        }

        private static int FindHeaderTerminator(List<byte> bytes)
        {
            for (var index = 0; index <= bytes.Count - 4; index++)
            {
                if (bytes[index] == 13 &&
                    bytes[index + 1] == 10 &&
                    bytes[index + 2] == 13 &&
                    bytes[index + 3] == 10)
                {
                    return index;
                }
            }

            return -1;
        }

        private static void WriteJson(Stream stream, int statusCode, string origin, object payload)
        {
            var serializer = new JavaScriptSerializer
            {
                MaxJsonLength = int.MaxValue
            };
            var body = Encoding.UTF8.GetBytes(serializer.Serialize(payload));
            WriteResponse(stream, statusCode, origin, "application/json; charset=utf-8", body);
        }

        private static void WriteConnectPage(
            Stream stream,
            string nonce,
            string returnOrigin,
            BridgeResponse payload)
        {
            var serializer = new JavaScriptSerializer
            {
                MaxJsonLength = int.MaxValue
            };
            var payloadJson = serializer.Serialize(payload);
            var payloadBase64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson));
            var html = $@"<!doctype html>
<html lang=""en"">
<head>
  <meta charset=""utf-8"">
  <meta name=""viewport"" content=""width=device-width,initial-scale=1"">
  <title>Connecting Playnite</title>
  <style>
    body {{ font: 16px system-ui, sans-serif; margin: 0; padding: 32px; color: #f5f1e8; background: #171a21; }}
    main {{ max-width: 520px; margin: 10vh auto; }}
    h1 {{ font-size: 24px; }}
    p {{ line-height: 1.55; color: #c9c4b9; }}
  </style>
</head>
<body>
  <main>
    <h1>Connecting your Playnite library...</h1>
    <p id=""status"">This window will close automatically.</p>
  </main>
  <script>
    (() => {{
      const status = document.getElementById(""status"");
      if (!window.opener) {{
        status.textContent = ""Return to What Should I Play? and choose Connect now again."";
        return;
      }}

      const bytes = Uint8Array.from(atob(""{payloadBase64}""), value => value.charCodeAt(0));
      const payload = JSON.parse(new TextDecoder().decode(bytes));
      window.opener.postMessage(
        {{ type: ""wsip-playnite-library"", nonce: ""{nonce}"", payload }},
        ""{returnOrigin}""
      );
      status.textContent = ""Library sent. You can close this window."";
      window.setTimeout(() => window.close(), 500);
    }})();
  </script>
</body>
</html>";
            WriteHtml(stream, 200, html);
        }

        private static string BuildMessagePage(string title, string message)
        {
            return $@"<!doctype html>
<html lang=""en"">
<head><meta charset=""utf-8""><title>{title}</title></head>
<body><h1>{title}</h1><p>{message}</p></body>
</html>";
        }

        private static void WriteHtml(Stream stream, int statusCode, string html)
        {
            var body = Encoding.UTF8.GetBytes(html);
            WriteResponse(stream, statusCode, null, "text/html; charset=utf-8", body);
        }

        private static string GetQueryValue(string requestPath, string key)
        {
            var queryStart = requestPath.IndexOf('?');
            if (queryStart < 0 || queryStart == requestPath.Length - 1)
            {
                return null;
            }

            foreach (var pair in requestPath.Substring(queryStart + 1).Split('&'))
            {
                var separator = pair.IndexOf('=');
                var name = separator >= 0 ? pair.Substring(0, separator) : pair;
                if (!string.Equals(Uri.UnescapeDataString(name), key, StringComparison.Ordinal))
                {
                    continue;
                }

                var value = separator >= 0 ? pair.Substring(separator + 1) : string.Empty;
                return Uri.UnescapeDataString(value.Replace("+", " "));
            }

            return null;
        }

        private static bool IsSafeNonce(string nonce)
        {
            if (string.IsNullOrWhiteSpace(nonce) || nonce.Length < 16 || nonce.Length > 128)
            {
                return false;
            }

            return nonce.All(character =>
                char.IsLetterOrDigit(character) ||
                character == '-' ||
                character == '_');
        }

        private static void WriteResponse(Stream stream, int statusCode, string origin, string contentType, byte[] body)
        {
            var statusText = statusCode == 200 ? "OK" :
                statusCode == 204 ? "No Content" :
                statusCode == 400 ? "Bad Request" :
                statusCode == 403 ? "Forbidden" :
                statusCode == 404 ? "Not Found" :
                statusCode == 405 ? "Method Not Allowed" :
                "Error";

            var headers = new StringBuilder()
                .Append($"HTTP/1.1 {statusCode} {statusText}\r\n")
                .Append($"Content-Type: {contentType}\r\n")
                .Append($"Content-Length: {body.Length}\r\n")
                .Append("Cache-Control: no-store\r\n")
                .Append("Connection: close\r\n")
                .Append("X-Content-Type-Options: nosniff\r\n");

            if (contentType.StartsWith("text/html", StringComparison.OrdinalIgnoreCase))
            {
                headers.Append("Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'\r\n")
                    .Append("Referrer-Policy: no-referrer\r\n")
                    .Append("X-Frame-Options: DENY\r\n");
            }

            if (!string.IsNullOrWhiteSpace(origin))
            {
                headers.Append($"Access-Control-Allow-Origin: {origin}\r\n")
                    .Append("Access-Control-Allow-Methods: GET, OPTIONS\r\n")
                    .Append("Access-Control-Allow-Headers: Content-Type\r\n")
                    .Append("Access-Control-Allow-Private-Network: true\r\n")
                    .Append("Vary: Origin\r\n");
            }

            headers.Append("\r\n");
            var headerBytes = Encoding.ASCII.GetBytes(headers.ToString());
            stream.Write(headerBytes, 0, headerBytes.Length);
            if (body.Length > 0)
            {
                stream.Write(body, 0, body.Length);
            }
        }

        private sealed class BridgeRequest
        {
            public string Method { get; set; }

            public string Path { get; set; }

            public Dictionary<string, string> Headers { get; set; }
        }
    }
}
