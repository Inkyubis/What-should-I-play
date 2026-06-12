using Microsoft.Win32;
using System;
using System.Diagnostics;
using System.IO;

namespace WhatShouldIPlayBridge
{
    internal static class PlayniteLauncherProtocol
    {
        internal const string Uri = "wsip-playnite://launch";
        private const string Scheme = "wsip-playnite";

        internal static void Register()
        {
            var executable = Process.GetCurrentProcess().MainModule.FileName;
            if (string.IsNullOrWhiteSpace(executable) ||
                !File.Exists(executable) ||
                !string.Equals(
                    Path.GetFileName(executable),
                    "Playnite.DesktopApp.exe",
                    StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Could not identify the Playnite desktop executable.");
            }

            var view = Environment.Is64BitOperatingSystem
                ? RegistryView.Registry64
                : RegistryView.Registry32;

            using (var root = RegistryKey.OpenBaseKey(RegistryHive.CurrentUser, view))
            using (var classes = root.CreateSubKey(@"Software\Classes"))
            using (var protocol = classes.CreateSubKey(Scheme))
            {
                protocol.SetValue(string.Empty, "URL:What Should I Play? Playnite launcher");
                protocol.SetValue("URL Protocol", string.Empty);

                using (var icon = protocol.CreateSubKey("DefaultIcon"))
                {
                    icon.SetValue(string.Empty, $"\"{executable}\"");
                }

                using (var command = protocol.CreateSubKey(@"shell\open\command"))
                {
                    // The protocol accepts no arguments and can only start Playnite.
                    command.SetValue(string.Empty, $"\"{executable}\"");
                }
            }
        }
    }
}
