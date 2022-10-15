<?php

/**
 * @package AspieSoftChurchSermonVideoList
 */
/*
Plugin Name: AspieSoft Church Sermon Video List
Version: 1.4.2
Description: An easy way for a church to list there sermon videos on their website.
Author: AspieSoft
Author URI: https://www.aspiesoft.com
License: GPLv2 or later
Text Domain: aspiesoft-church-sermon-video-list
*/

// In God We Trust

/*
Copyright (C) 2020 aspiesoftweb@gmail.com

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
*/

if (!defined('ABSPATH')) {
  http_response_code(404);
  die('404 Not Found');
}

if (!class_exists('AspieSoftChurchSermonVideoList')) {

  class AspieSoftChurchSermonVideoList {

    public $pluginName;
    private $settings_icon;

    function __construct() {
      $this->pluginName = plugin_basename(__FILE__);
    }

    function startPlugin() {
      if (!is_admin()) {
        require_once(plugin_dir_path(__FILE__) . 'main.php');
        $aspieSoftChurchSermonVideoListMain->start();
      }
    }

    function register() {
      if (is_admin()) {
        $this->settings_icon = plugins_url('assets/settings-icon.png', __FILE__);
        add_action('admin_menu', array($this, 'add_admin_pages'));
        add_filter("plugin_action_links_$this->pluginName", array($this, 'settings_link'));
      }
      //add_action('wp_enqueue_scripts', array($this, 'enqueue'));
    }

    function settings_link($links) {
      array_unshift($links, '<a href="admin.php?page=sermons">Settings</a>');
      return $links;
    }

    function add_admin_pages() {
      add_menu_page('Sermons', 'Sermons', 'manage_options', 'sermons', array($this, 'admin_index'), $this->settings_icon, 100);
    }

    function admin_index() {
      require_once(plugin_dir_path(__FILE__) . 'admin.php');
    }

    function activate() {
      //flush_rewrite_rules();
    }

    function deactivate() {
      //flush_rewrite_rules();
    }

    function enqueue() {
      wp_enqueue_style('aspieSoftChurchSermonVideoListStyle', plugins_url('/assets/style.css', __FILE__), array(), '1.4');
      wp_enqueue_script('aspieSoftChurchSermonVideoListScript', plugins_url('/assets/script.js', __FILE__), array('jquery'), '1.7', true);
    }
  }

  $aspieSoftChurchSermonVideoList = new AspieSoftChurchSermonVideoList();
  $aspieSoftChurchSermonVideoList->register();
  $aspieSoftChurchSermonVideoList->startPlugin();

  register_activation_hook(__FILE__, array($aspieSoftChurchSermonVideoList, 'activate'));
  register_deactivation_hook(__FILE__, array($aspieSoftChurchSermonVideoList, 'deactivate'));
}
