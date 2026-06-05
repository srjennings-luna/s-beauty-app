import UIKit
import Capacitor
import AVFoundation

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Set the UIWindow's background color to espresso (#16110d) so
        // the lowest iOS view layer matches the rest of the cold-launch
        // view stack:
        //   - UIWindow.backgroundColor = espresso (here)
        //   - LaunchScreen.storyboard view bg = espresso (storyboard fix)
        //   - WebView container bg = espresso (capacitor.config.ts
        //     ios.backgroundColor)
        //   - body bg = espresso (app/globals.css)
        //
        // Without this line, UIWindow defaults to white. During the
        // splash → WebView handoff there's a brief moment where the
        // window itself is visible; without this, that flashed white.
        // Sheri caught the white flash on Simulator (June 4, 2026).
        if let window = self.window {
            window.backgroundColor = UIColor(red: 0.0862745098, green: 0.0666666667, blue: 0.0509803922, alpha: 1.0)
        }

        // Configure the shared AVAudioSession for music-style playback.
        //
        // .playback category means:
        //   - Audio continues when the silent / ring switch is enabled
        //     (matches what users expect from any music app — a P&P
        //     Auditio playing should not be muted by the silent switch)
        //   - Audio continues when the screen locks or the app is
        //     backgrounded (paired with UIBackgroundModes "audio" in
        //     Info.plist)
        //   - Lockscreen + Control Center surface MediaSession
        //     metadata set from JS (navigator.mediaSession), so the
        //     user sees the track title, composer, and artwork on the
        //     lockscreen and can pause / resume from there
        //
        // .mixWithOthers is intentionally NOT used — playing Contueri
        // audio should pause Spotify / Apple Music etc, the same way
        // any foreground music app does. The user has chosen to listen
        // to a P&P track; their other audio should yield.
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default, options: [])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            // No-op: if audio session fails to configure, audio still
            // plays in foreground via the default category, just
            // without background / lockscreen support.
        }

        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}
