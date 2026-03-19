<div class="partial-demo">
  <h4><?= htmlspecialchars($name) ?></h4>
  <?php
    $label = $name;
    include $GLOBALS['__storybook_ci4_template_path'] . 'partials/badge.php';
  ?>
</div>
