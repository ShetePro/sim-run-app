# SimRun User Guide

> [中文版](./USER_GUIDE.md)

Welcome to SimRun! This is a mobile app designed specifically for running enthusiasts to help you record every running route, track workout data, and achieve your fitness goals.

---

## 📱 Features Overview

- **Real-time Running Tracking** - GPS accurately records running routes, distance, and pace
- **Live Activity / Dynamic Island Support** - View real-time data even when your screen is locked
- **Route Visualization** - View gradient-colored running tracks on the map
- **Data Statistics** - Today's workout data, lifetime cumulative records, history management
- **Cloud Sync** - iCloud automatic backup, supports cross-device recovery
- **Data Import/Export** - Support JSON/GPX format import and export
- **Voice Announcements** - Multiple voice characters, customizable announcement frequency
- **Running Plan** - Set personal running goals
- **Profile Management** - Custom avatars and body data management
- **Map Settings** - Customize map type, path color and width
- **Dark Mode** - Support for light/dark theme switching
- **Long Press Gestures** - Long press to end running, long press to delete records

---

## 🚀 Quick Start

### First Time Use

1. **Launch the App**
   - Open the SimRun app
   - Allow location permissions (for tracking running routes)
   - Allow notification permissions (for background running reminders)

2. **Select Language**
   - App automatically sets language based on system (Chinese/English)
   - Can manually switch in "Me > Language Settings"

3. **Complete Your Profile**
   - Tap "Me" at the bottom to enter the profile center
   - Tap "Edit Profile" to set your avatar, nickname, height, weight, etc.
   - Accurate body data helps calculate calorie consumption more precisely

4. **Set Your Avatar**
   - Tap the avatar area on the profile page
   - Select a photo from your gallery, supports 1:1 square cropping
   - The avatar will automatically sync to the home screen

---

## 🏃‍♂️ Start Running

### Start Recording

1. Tap the big **"Start Running"** button on the home screen
2. Wait for the 3-2-1 countdown to finish
3. View real-time data including distance, time, and pace
4. GPS signal strength indicator shows current positioning accuracy

### During Running

| Feature             | Action                                                                   |
| ------------------- | ------------------------------------------------------------------------ |
| Pause/Resume        | Tap the pause button to pause timing, tap resume to continue             |
| View Map            | View real-time route drawing on the running page                         |
| Lock Screen Display | iOS users can view real-time data on lock screen / Dynamic Island        |
| End Running         | **Long press "End" button for 1.5 seconds** (prevent accidental touches) |

### End Running

1. **Long press "End" button for 1.5 seconds** (triggered when progress bar fills)
2. View complete workout statistics for this session
3. Add a running title and notes (optional)
4. Tap "Save Record" to complete saving
5. Can export as JSON or GPX format to share

---

## 📊 View Running Records

### Home Screen Data Cards

- **Today's Data** - View today's cumulative distance, duration, calories, and pace
- **Lifetime Stats** - Total running sessions, total distance, total duration
- **Recent Activity** - Quickly view your last running record

### History Records

1. Tap the "History" tab at the bottom
2. Date-grouped running records list
3. **Long press any record to delete** (iOS gallery style)
4. Tap any record to view details:
   - Gradient-colored running route (green = start, red = end)
   - Complete data statistics
   - Personal notes
   - Export function

### Delete Records

- **Long press** any running record in the history list
- A confirmation dialog will pop up
- Confirm to permanently delete the record

---

## 🗺️ Map Route Guide

The running route map uses gradient colors to show running progress:

- 🟢 **Green** - Running start point
- 🟡 **Yellow** - Middle section of the route
- 🔴 **Red** - Running end point

The map also displays:

- Start and end point markers
- Semi-transparent pulse circle effects
- Running time range label

### Map Settings

In "Me > Map Settings" you can customize:

- **Map Type** - Standard, Satellite, Hybrid
- **Path Color** - Blue, Green, Orange, Red, Rainbow
- **Path Width** - Thin, Medium, Thick

---

## ⚡ Live Activity / Dynamic Island (iOS)

Supports Live Activity feature for iOS 16.1+:

- **Lock Screen Display** - View real-time distance, time, and pace even when locked
- **Dynamic Island** - iPhone 14 Pro+ users can view running status in the Dynamic Island
- **Real-time Updates** - Data updates automatically every second
- **Smart Expiration** - Automatically closes 5 minutes after app is killed

### Requirements

- iOS 16.1 or higher
- Allow Live Activity in "Settings > SimRun"

---

## ☁️ Cloud Sync & Data Management

### iCloud Auto Backup

1. Go to "Me > Cloud Sync"
2. Enable "Auto Sync" feature
3. Can choose "WiFi Only" to save mobile data
4. Automatically backs up to iCloud after each run

### Manual Backup & Restore

- **Backup Now** - Manually trigger database backup to iCloud
- **Restore Data** - Restore from iCloud backup (will overwrite current data)

### Import from File

Supports importing running records from other devices:

1. Go to "Me > Cloud Sync"
2. Tap "Import from File"
3. Select JSON or GPX format file
4. Automatically parses and imports to local database

### Export Running Data

On the running details page:

1. Tap "Export" button
2. Select format:
   - **JSON** - Complete data (recommended)
   - **GPX** - Universal track format, can import to other sports apps
   - **CSV** - Table data
3. Export via system share

---

## 🔊 Voice Announcement Settings

Set up in "Me > Voice Settings":

### Voice Characters

Multiple voice characters available:

- **Professional Coach** - Calm and professional male voice
- **Energetic Partner** - Energetic female voice
- **Gentle Encouragement** - Gentle and sweet female voice
- **Robot** - Mechanical style

### Announcement Frequency

Choose announcement interval:

- **Off** - No announcements
- **Every 1 km** - Announce every 1 kilometer
- **Every 2 km** - Announce every 2 kilometers
- **Every 5 km** - Announce every 5 kilometers
- **Every 10 min** - Announce every 10 minutes
- **Every 30 min** - Announce every 30 minutes

Announcement includes: current distance, time, pace, calories burned

---

## 👤 Profile Management

### Edit Profile

1. Tap "Me" at the bottom to enter the profile center
2. Tap "Edit Profile"
3. You can modify:
   - **Avatar** - Select an image from your gallery
   - **Nickname** - Set a personalized name
   - **Bio** - A one-sentence introduction about yourself
   - **Gender** - Male/Female
   - **Height/Weight/Age** - Used for precise workout data calculation

### Avatar Upload

- Supports selecting images from your phone's gallery
- Automatically crops to 1:1 square
- Avatar changes will automatically sync to the home screen

### Settings Options

In the "Me" page you can also set:

- **Language** - Chinese/English
- **Dark Mode** - Light/Dark/Follow System
- **Cloud Sync** - iCloud backup settings
- **Map Settings** - Map display preferences
- **Voice Announcements** - Voice settings
- **Running Plan** - Set running goals

---

## 🌙 Theme Settings

SimRun supports light/dark modes:

- **Auto Switch** - Follow system automatic theme switching
- **Manual Switch** - Toggle dark/light mode in "Me" page

---

## 💡 Usage Tips

### Get More Accurate GPS Data

- Run in open areas, avoiding tall buildings or trees
- Enable "High Accuracy Positioning" mode
- Wait for GPS signal to stabilize before starting your run
- Observe the signal strength indicator (4 bars = excellent, 1 bar = poor)

### Prevent Accidental End of Running

- Use **long press gesture** (1.5 seconds) to end running
- Wait for progress bar to fill before releasing
- Release early to cancel end operation

### Extend Battery Life

- Reduce screen brightness
- Close unnecessary background apps
- Use power saving mode (may affect GPS accuracy)
- Only sync data on WiFi

### Data Security & Backup

- All running data is saved locally
- Enable iCloud auto backup to prevent data loss
- Regularly export important records to JSON files
- When switching devices, restore via iCloud or file import

---

## 🔧 FAQ

**Q: Why is GPS positioning inaccurate?**

> A: Please ensure you're using it in an open area, avoiding building obstructions. First-time use may require waiting about 30 seconds for positioning to complete. Check the signal strength indicator to understand current GPS quality.

**Q: Live Activity is not showing?**

> A: Please ensure: 1) iOS 16.1+ system; 2) Live Activity is allowed in system settings; 3) Running recording has already started.

**Q: How to delete history records?**

> A: In the history list, long press any running record, a confirmation dialog will pop up, then tap "Delete".

**Q: How to modify saved running records?**

> A: View details in history records. Currently, modifying saved route data is not supported, but you can add/modify notes.

**Q: Avatar upload failed?**

> A: Please ensure gallery access permission has been granted. Check permission settings in "Settings > Privacy > Photos".

**Q: What languages are supported?**

> A: Currently supports Simplified Chinese and English. The app automatically sets based on system language, or you can manually switch in "Me > Language Settings".

**Q: How to backup data to a new phone?**

> A: Method 1: Enable iCloud sync, it will automatically restore when you log in with the same Apple ID on the new device. Method 2: Export JSON file from old device, then use "Import from File" on new device.

**Q: Voice announcements not working?**

> A: Please check: 1) If voice announcements are enabled; 2) Announcement frequency settings; 3) If phone is on silent mode; 4) If system volume is sufficient.

**Q: Long press to end running not working?**

> A: Please ensure long press time reaches 1.5 seconds, watch the progress bar fill up before releasing. If released before progress is complete, the end operation will be canceled.

---

## 📞 Technical Support & Feedback

If you encounter issues or have feature suggestions, please contact us:

- **GitHub Issues**: [Submit issues or suggestions](https://github.com/ShetePro/sim-run-app/issues)
- **Email**: sheteprolin@gmail.com
- **User Guide**: View in "Me > Help & Feedback"

---

## 📄 Version Information

- Current Version: v1.0.0
- Supported Platforms: iOS 16.0+ / Android 10+
- Last Updated: February 2026

---

**Happy Running!🏃‍♀️🏃‍♂️**
