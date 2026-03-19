<!DOCTYPE html>
<html>
<head>
  <title><?= htmlspecialchars($title) ?></title>
</head>
<body>
  <header class="layout-header">
    <nav>Home</nav>
  </header>
  <main class="layout-content">
    <?= $contentForLayout ?>
  </main>
  <footer class="layout-footer">
    &copy; 2026 Storybook PHP
  </footer>
</body>
</html>
