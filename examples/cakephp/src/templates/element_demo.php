<div class="element-demo">
  <h4><?= htmlspecialchars($name) ?></h4>
  <?php
    $label = $name;
    include $GLOBALS['__storybook_cake_template_path'] . 'element/badge.php';
  ?>
</div>
