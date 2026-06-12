using System;
using System.Collections.Generic;

namespace WhatShouldIPlayBridge
{
    public sealed class BridgeResponse
    {
        public string Bridge { get; set; }

        public string Version { get; set; }

        public DateTime GeneratedAtUtc { get; set; }

        public List<BridgeGame> Games { get; set; }
    }

    public sealed class BridgeGame
    {
        public string Name { get; set; }

        public string Source { get; set; }

        public bool Installed { get; set; }

        public ulong Playtime { get; set; }

        public ulong PlayCount { get; set; }

        public bool Favorite { get; set; }

        public int? ReleaseYear { get; set; }

        public DateTime? LastActivity { get; set; }

        public List<string> Genres { get; set; }

        public List<string> Features { get; set; }

        public List<string> Platforms { get; set; }

        public List<string> Categories { get; set; }

        public List<string> Tags { get; set; }
    }
}
