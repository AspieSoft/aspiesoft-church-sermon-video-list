<?php

/**
 * @package AspieSoftChurchSermonVideoList
 */

if (!defined('ABSPATH')) {
  http_response_code(404);
  die('404 Not Found');
}


$computerId = hash('sha256', sanitize_text_field($_SERVER['HTTP_USER_AGENT']) . sanitize_text_field($_SERVER['LOCAL_ADDR']) . sanitize_text_field($_SERVER['LOCAL_PORT']) . sanitize_text_field($_SERVER['REMOTE_ADDR']));

// generate random session token
$newSettingsToken = str_replace('"', '`', wp_generate_password(64));


$sermonList = '';

if (isset($_POST['sermon-list'])) {

  // verify session token
  $settingsToken = get_option('AspieSoft_Settings_Token' . $computerId);
  if (!isset($settingsToken) || $settingsToken == '' || $settingsToken == null) {
    http_response_code(401);
    exit();
  }
  $sToken = json_decode($settingsToken, true);
  if (!$sToken || !$sToken['expires'] || round(microtime(true) * 1000) > $sToken['expires']) {
    delete_option('AspieSoft_Settings_Token' . $computerId);
    http_response_code(401);
    exit();
  }
  if (!isset($_POST['AspieSoft_Settings_Token'])) {
    http_response_code(403);
    exit();
  }
  if ($_POST['AspieSoft_Settings_Token'] !== $sToken['token']) {
    http_response_code(403);
    exit();
  }
  delete_option('AspieSoft_Settings_Token' . $computerId);


  $sermonList = sanitize_textarea_field($_POST['sermon-list']);
  $sermonList = preg_replace('/\\\\([\\\\"\'])/', '$1', $sermonList);
  update_option('AspieSoftChurchSermonVideoList', $sermonList);
} else {
  $sermonList = sanitize_textarea_field(get_option('AspieSoftChurchSermonVideoList'));
}

if (!isset($sermonList) || !$sermonList) {
  $sermonList = '[]';
}


update_option('AspieSoft_Settings_Token' . $computerId, wp_json_encode(array(
  'token' => $newSettingsToken,
  'expires' => round(microtime(true) * 1000) + 7200 * 1000, // 2 hours
)), false);

?>
<style>
  .sermon-list {
    box-sizing: border-box;
    padding: 20px 40px;
    width: 100%;
  }

  .sermon-list form {
    display: none;
  }

  .sermon-list input[type="button"] {
    font-size: 1.2rem;
    padding: 8px 12px;
    border: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    background: #0c77db;
    color: #ffffff;
    cursor: pointer;
    width: 100%;
    margin: 12px 0;
  }

  .sermon-list input[type="button"]:hover {
    background: #1081eb;
  }

  .list {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 15px;
    box-sizing: border-box;
    width: 100%;
    min-height: 80px;
    padding: 20px 40px;
  }

  .add-item {
    box-sizing: border-box;
    width: 100%;
    min-height: 50px;
    color: #0c83e4;
    border: solid 3px;
    border-radius: 15px;
    text-align: center;
    font-size: 3rem;
    font-weight: bold;
    padding: 20px;
    cursor: pointer;
    user-select: none;
  }

  .add-item:hover {
    color: #3796e4;
  }

  .item {
    box-sizing: border-box;
    width: 100%;
    min-height: 50px;
    border: solid 3px #3796e4;
    border-radius: 15px;
    padding: 20px;
    margin-top: 20px;
    font-size: 1.2rem;
  }

  .item input {
    font-size: 1.2rem;
    padding: 8px 12px;
    border: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    margin: 5px;
  }

  .item input:focus {
    outline: none;
    box-shadow: 0 0 8px rgba(55, 150, 228, 0.5);
  }

  .item label[for="visible"],
  .item label[for="landscape"] {
    float: right;
  }

  .item .checkboxes {
    float: right;
    display: flex;
    flex-direction: column;
  }

  .item input[name="date"],
  .item input[name="scripture"] {
    width: 300px;
    max-width: 100%;
  }

  .item input[name="name"],
  .item input[name="url"] {
    width: calc(100% - 300px - 8rem);
    min-width: 300px;
    max-width: 100%;
  }

  .item input[type="button"] {
    background: #d11313;
    color: #ffffff;
    cursor: pointer;
    width: auto;
  }

  .item input[type="button"]:hover {
    background: #df2222;
  }

  @media(max-width: 1099px) {
    .sermon-list {
      padding: 5px;
    }

    .list {
      padding: 10px 20px;
      border-radius: 8px;
    }

    .item label[for="visible"],
    .item label[for="landscape"] {
      float: left;
    }

    .item .checkboxes {
      float: left;
      display: contents;
    }

    .item input[name="name"],
    .item input[name="url"] {
      width: 100%;
      min-width: 0;
    }

    .item input[name="date"],
    .item input[name="scripture"] {
      width: 100%;
    }
  }
</style>

<div class="sermon-list">
  <h1>Sermon List</h1>
  <form action="" method="post">
    <input type="hidden" name="AspieSoft_Settings_Token" value="<?php echo $newSettingsToken; ?>">
    <input type="text" name="sermon-list">
  </form>
  <input type="button" value="Save Changes">
  <div class="list">
    <div class="add-item">+</div>
  </div>
</div>

<script>
  ;

  function SermonDeleteItem(elm) {
    elm.parentNode.remove();
  }

  ;
  (function() {
    const itemList = <?php echo $sermonList; ?>;

    const list = document.querySelector('.sermon-list .list');
    const addItem = list.querySelector('.add-item');
    const submitForm = document.querySelector('.sermon-list form');

    document.querySelector('.sermon-list input[type="button"]').addEventListener('click', function(e) {
      e.preventDefault();
      let result = [];
      list.querySelectorAll('.item').forEach(function(item) {
        result.push({
          visible: item.querySelector('input[name="visible"]').checked,
          landscape: item.querySelector('input[name="landscape"]').checked,
          date: item.querySelector('input[name="date"]').value.replace(/^([0-9]+)-([0-9]+)-([0-9]+)$/, function(_, y, m, d) {
            return `${Number(m)}-${Number(d)}-${Number(y)}`;
          }),
          name: item.querySelector('input[name="name"]').value,
          scripture: item.querySelector('input[name="scripture"]').value,
          url: item.querySelector('input[name="url"]').value,
        });
      });
      result = JSON.stringify(result);
      submitForm.querySelector('input[name="sermon-list"]').value = result;
      submitForm.submit();
    });

    addItem.addEventListener('click', function(e) {
      e.preventDefault();
      addNewItem(function(item) {
        item.querySelector('input[name="date"]').value = new Date().toISOString().substring(0, 10);
      });
    });

    function addNewItem(cb) {
      let item = document.createElement('div');
      item.classList.add('item');

      item.innerHTML = `
      <div class="checkboxes">
        <label for="visible"><input type="checkbox" name="visible" checked>Show</label>
        <label for="landscape"><input type="checkbox" name="landscape">Landscape</label>
      </div>
      <input type="date" name="date">
      <input type="text" name="name" placeholder="Name">
      <br>
      <input type="text" name="scripture" placeholder="Scripture">
      <input type="text" name="url" placeholder="URL">
      <input type="button" value="Delete" onclick="SermonDeleteItem(this);">
      `;

      list.insertBefore(item, addItem.nextElementSibling);

      if (typeof cb === 'function') {
        cb(item);
      }
    }

    for (let i = itemList.length - 1; i >= 0; i--) {
      addNewItem(function(item) {
        item.querySelector('input[name="visible"]').checked = itemList[i].visible;
        item.querySelector('input[name="landscape"]').checked = itemList[i].landscape;
        item.querySelector('input[name="date"]').value = new Date(itemList[i].date).toISOString().substring(0, 10);
        item.querySelector('input[name="name"]').value = itemList[i].name;
        item.querySelector('input[name="scripture"]').value = itemList[i].scripture;
        item.querySelector('input[name="url"]').value = itemList[i].url;
      });
    }

  })();
</script>