=== Church Sermon Video List ===
Contributors: AspieSoft
Tags: church, sermon, video, list, facebook, youtube, search
Requires at least: 3.0.1
Tested up to: 5.3
Stable tag: 5.3
Requires PHP: 5.2.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

An easy way for a church to list there sermon videos on their website.

== Description ==

An easy way for a church to list there sermon videos on their website.
It includes an advanced search, which will search based on date, name, or scripture.
For example, If you have a video with the scripture set to "Psalm 16:1-11", the search will allow "Psalm 16:8" to match that, because 8 is between 1 and 11.
The search also includes some spelling corrections, to help people who spell things phonetically.

I originally made this plugin for a pastor I know, and decided to make it public so other churches could use it.

How To Use:

[cs-list]

Add new videos at the top of the list.
The top video will automatically be selected when a user goes to the page, unless a video date is specified in the url query.

[cs-video fb-id='12345' fb-profile='fb.user' date='12-28-1969' name='Faith Of A Mustard Seed' scripture='Matthew 13:31-32']

[cs-video url='https://www.facebook.com/plugins.php?EmbedInfo' date='12-28-1969' name='Faith Of A Mustard Seed' scripture='Matthew 13:31-32']

[cs-video url='<iframe src="https://www.facebook.com/plugins.php?EmbedInfo" OtherAttrs></iframe>' date='12-28-1969' name='Faith Of A Mustard Seed' scripture='Matthew 13:31-32']

To hide a video until later: (add hide=true) (useful if the video is not available yet, and you already know the name and scripture)
[cs-video url='N/A' hide=true name='Faith Of A Mustard Seed' scripture='Matthew 13:31-32']

[cs-video ...]

...

[/cs-list]

== Installation ==
1. Upload plugin to the /wp-content/plugins
2. Activate the plugin through the "Plugins" menu in WordPress
3. Go to this plugins Settings and Check "Plugin Enabled" To Enable the plugin

== Frequently Asked Questions ==

= Can users share links to past videos? =
yes, the url is updated with a query based on the video date, every time someone clicks on a video in the list.
this should not cause the page to refresh.

= Does this plugin work with facebook embeds? =
yes, you can directly paste the facebook embed code, or just the src url of the embed code.

== Changelog ==

= 1.1 =
Improved Search Algorithm

= 1.0 =
First Version

== Upgrade Notice ==

= 1.1 =
Improved Search Algorithm

= 1.0 =
First Version
