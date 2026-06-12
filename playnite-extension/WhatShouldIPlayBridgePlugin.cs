using Playnite.SDK;
using Playnite.SDK.Events;
using Playnite.SDK.Models;
using Playnite.SDK.Plugins;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace WhatShouldIPlayBridge
{
    [LoadPlugin]
    public sealed class WhatShouldIPlayBridgePlugin : GenericPlugin
    {
        private static readonly ILogger Logger = LogManager.GetLogger();
        private LocalBridgeServer server;

        public override Guid Id { get; } = Guid.Parse("8E78D029-94FB-43E4-A746-6F058A2D57CB");

        public WhatShouldIPlayBridgePlugin(IPlayniteAPI api) : base(api)
        {
            Properties = new GenericPluginProperties
            {
                HasSettings = false
            };
        }

        public override void OnApplicationStarted(OnApplicationStartedEventArgs args)
        {
            RegisterLauncherProtocol();
            StartBridge();
        }

        public override void OnApplicationStopped(OnApplicationStoppedEventArgs args)
        {
            StopBridge();
        }

        public override void Dispose()
        {
            StopBridge();
            base.Dispose();
        }

        public override IEnumerable<MainMenuItem> GetMainMenuItems(GetMainMenuItemsArgs args)
        {
            yield return new MainMenuItem
            {
                MenuSection = "@What Should I Play?",
                Description = "Open website",
                Action = _ => Process.Start("https://inkyubis.github.io/What-should-I-play/")
            };

            yield return new MainMenuItem
            {
                MenuSection = "@What Should I Play?",
                Description = "Bridge status",
                Action = _ => PlayniteApi.Dialogs.ShowMessage(
                    server != null && server.IsRunning
                        ? $"The read-only bridge is running at http://127.0.0.1:{LocalBridgeServer.Port}.\n\nOnly the What Should I Play? website and local development origins are allowed to read it."
                        : "The bridge is not running. Restart Playnite or check Playnite's extension log.",
                    "What Should I Play? Bridge")
            };
        }

        private void StartBridge()
        {
            if (server != null && server.IsRunning)
            {
                return;
            }

            try
            {
                server = new LocalBridgeServer(CreateLibrarySnapshot);
                server.Start();
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "Failed to start What Should I Play? bridge.");
                PlayniteApi.Notifications.Add(
                    "WhatShouldIPlayBridge.StartFailure",
                    "What Should I Play? could not start its local bridge. Check the extension log for details.",
                    NotificationType.Error);
            }
        }

        private void RegisterLauncherProtocol()
        {
            try
            {
                PlayniteLauncherProtocol.Register();
            }
            catch (Exception exception)
            {
                Logger.Error(exception, "Failed to register What Should I Play? launcher protocol.");
                PlayniteApi.Notifications.Add(
                    "WhatShouldIPlayBridge.ProtocolFailure",
                    "What Should I Play? could not register its Playnite launcher link. The bridge still works while Playnite is open.",
                    NotificationType.Info);
            }
        }

        private void StopBridge()
        {
            server?.Dispose();
            server = null;
        }

        private BridgeResponse CreateLibrarySnapshot()
        {
            BridgeResponse response = null;
            PlayniteApi.MainView.UIDispatcher.Invoke(() =>
            {
                var games = PlayniteApi.Database.Games
                    .Where(game => !game.Hidden && !string.IsNullOrWhiteSpace(game.Name))
                    .OrderBy(game => game.Name)
                    .Select(game => new BridgeGame
                    {
                        Name = game.Name,
                        Source = game.Source?.Name ?? "Playnite",
                        Installed = game.IsInstalled,
                        Playtime = game.Playtime,
                        PlayCount = game.PlayCount,
                        Favorite = game.Favorite,
                        ReleaseYear = game.ReleaseYear,
                        LastActivity = game.LastActivity,
                        Genres = Names(game.Genres),
                        Features = Names(game.Features),
                        Platforms = Names(game.Platforms),
                        Categories = Names(game.Categories),
                        Tags = Names(game.Tags)
                    })
                    .ToList();

                response = new BridgeResponse
                {
                    Bridge = "What Should I Play? Bridge",
                    Version = "0.4.0",
                    GeneratedAtUtc = DateTime.UtcNow,
                    Games = games
                };
            });

            return response;
        }

        private static List<string> Names<T>(IEnumerable<T> values) where T : DatabaseObject
        {
            if (values == null)
            {
                return new List<string>();
            }

            return values
                .Select(value => value?.Name)
                .Where(value => !string.IsNullOrWhiteSpace(value))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(value => value)
                .ToList();
        }
    }
}
