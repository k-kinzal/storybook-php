<div class="parser-demo">
  <h3>{heading}</h3>
  <p>{description}</p>
  <table class="metrics-table">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Count</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      {metrics}
      <tr>
        <td>{name}</td>
        <td>{count}</td>
        <td>{change}</td>
      </tr>
      {/metrics}
    </tbody>
  </table>
</div>
