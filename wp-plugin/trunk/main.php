<?php
/**
* @package AspieSoftChurchSermonVideoList
*/

if(!defined('ABSPATH')){
  http_response_code(404);
  die('404 Not Found');
}

if(!class_exists('AspieSoftChurchSermonVideoListMain')){

  class AspieSoftChurchSermonVideoListMain{

    function start(){
      add_shortcode('cs-list', array($this, 'video_list'));
      add_shortcode('cs-video', array($this, 'video_list'));
    }

    function video_list($atts = '', $content = null){
      $attr = shortcode_atts(array(
        'url' => false,
        'name' => false,
        'date' => false,
        'scripture' => false,
        'fb-id' => false, 'fbid' => false,
        'fb-profile' => false, 'fbprofile' => false,
        'hide' => false, 'hidden' => false,
      ), $atts);

      foreach($attr as $k => $v){
        $vType = gettype($v);
        if($vType === 'string'){
          $attr[sanitize_key($k)] = sanitize_text_field($v);
        }else if($vType === 'boolean'){
          $attr[sanitize_key($k)] = !!$v;
        }else if($vType === 'integer'){
          $attr[sanitize_key($k)] = intval($v);
        }else if($vType === 'double'){
          $attr[sanitize_key($k)] = floatval($v);
        }else{
          $attr[sanitize_key($k)] = null;
        }
      }

      if($attr['hide'] || $attr['hidden']){
        return '';
      }

      if($attr['url'] || $attr['name'] || $attr['date']){
        $url = $attr['url'];
        if(strpos($url, 'iframe') !== false && strpos($url, 'src="') !== false){
          $url = $this->get_string_between($url, 'src="', '"');
        }
        $name = esc_html__($attr['name']);
        $date = esc_html($attr['date']);
        if(!$date){
          $date = date('d-m-Y');
        }
        $scripture = esc_html($attr['scripture']);
        $url = esc_url($url);
        if($name){
          $name = $name;
        }
        $date = $date;

        $fbID = $attr['fb-id'];
        if(!$fbID){$fbID = $attr['fbid'];}
        if($fbID){
          $fbID = htmlentities($fbID);
        }
        $fbProfile = $attr['fb-profile'];
        if(!$fbProfile){$fbProfile = $attr['fbprofile'];}
        if($fbProfile){
          $fbProfile = htmlentities($fbProfile);
        }

        $name = preg_replace('/&amp;amp;/', '&amp;', $name);
        $date = preg_replace('/&amp;amp;/', '&amp;', $date);
        $url = preg_replace('/&amp;amp;/', '&amp;', $url);
        $scripture = preg_replace('/&amp;amp;/', '&amp;', $scripture);

        $result = '<a class="video-list-item"';
        if($url){
          $result .= ' href="'.esc_url($url).'"';
        }else if($fbID && $fbProfile){
          $result .= ' href="'.esc_url('https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2F'.$fbProfile.'%2Fvideos%2F'.$fbID.'%2F&show_text=0').'"';
        }else{
          $result .= ' href=""';
        }
        if($date){
          $result .= ' date="'.$date.'"';
        }
        if($scripture){
          $result .= ' scripture="'.$scripture.'"';
        }

        $result .= '>';
        if($name){
          $result .= $name;
        }else{
          $result .= $date;
        }
        if($scripture){
          $result .= '<font class="video-list-item-scripture">'.$scripture.'</font>';
        }
        if($name){
          $result .= '<font class="video-list-item-date">'.$date.'</font>';
        }else{
          $result .= $date;
        }
        return $result;
      }

      if($content){
        $content = do_shortcode(sanitize_text_field($content));
      }else{
        $content = '';
      }

      $openTag = '<div class="video-list-container"><div class="video-list-current-name"></div><div class="video-list-iframe-container"><iframe class="video-list-iframe" width="267" height="476" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allowFullScreen="true"></iframe></div><div class="video-list-search-container"><input type="text" class="video-list-search" placeholder="Search for any Name, Bible Verse, or Date"><br><div class="video-list">';
      $closeTag = '</div></div></div>';

      return $openTag.$content.$closeTag;
    }

    function get_string_between($string, $start, $end, $pos = 1){
      $cPos = 0;
      $ini = 0;
      $result = '';
      for($i = 0; $i < $pos; $i++){
        $ini = strpos($string, $start, $cPos);
        if ($ini == 0) return '';
        $ini += strlen($start);
        $len = strpos($string, $end, $ini) - $ini;
        $result = substr($string, $ini, $len);
        $cPos = $ini + $len;
      }
      return $result;
    }

  }

  $aspieSoftChurchSermonVideoListMain = new AspieSoftChurchSermonVideoListMain();

}
