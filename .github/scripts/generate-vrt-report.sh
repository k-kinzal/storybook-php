#!/usr/bin/env bash
set -euo pipefail

PR_NUMBER="${1:-}"
PR_URL="${PR_URL:-}"
RUN_URL="${RUN_URL:-}"
RUN_ID="${RUN_ID:-}"
RESULTS_DIR="vrt-results"
OUTPUT="vrt-report.html"
DIFF_SUMMARY="diff-summary.md"
HAS_DIFFS=false
TOTAL_DIFFS=0
TOTAL_EXAMPLES=0

# Collect data per example
declare -A EXAMPLE_DIFFS
declare -a CHANGED_EXAMPLES=()
declare -a PASSED_EXAMPLES=()

if [ ! -d "$RESULTS_DIR" ]; then
  echo "No VRT results directory found. Skipping report generation."
  echo "HAS_DIFFS=false" >> "$GITHUB_ENV"
  exit 0
fi

for artifact_dir in "$RESULTS_DIR"/vrt-results-*; do
  [ -d "$artifact_dir" ] || continue
  example_name="${artifact_dir##*vrt-results-}"
  TOTAL_EXAMPLES=$((TOTAL_EXAMPLES + 1))

  diff_count=0
  while IFS= read -r -d '' _; do
    diff_count=$((diff_count + 1))
  done < <(find "$artifact_dir" -path "*/__diffs__/*.png" -print0 2>/dev/null || true)

  if [ "$diff_count" -gt 0 ]; then
    HAS_DIFFS=true
    TOTAL_DIFFS=$((TOTAL_DIFFS + diff_count))
    EXAMPLE_DIFFS["$example_name"]="$diff_count"
    CHANGED_EXAMPLES+=("$example_name")
  else
    PASSED_EXAMPLES+=("$example_name")
  fi
done

CHANGED_COUNT="${#CHANGED_EXAMPLES[@]}"
PASSED_COUNT="${#PASSED_EXAMPLES[@]}"

# Helper: base64 encode a file (Linux & macOS compatible)
b64_encode() {
  if base64 -w 0 /dev/null >/dev/null 2>&1; then
    base64 -w 0 "$1"
  else
    base64 "$1" | tr -d '\n'
  fi
}

# ── Begin HTML output ──
pr_title="PR #${PR_NUMBER}"
pr_link="${pr_title}"
[ -n "$PR_URL" ] && pr_link="<a href=\"${PR_URL}\">${pr_title}</a>"
run_label="run #${RUN_ID:-$PR_NUMBER}"
run_link="${run_label}"
[ -n "$RUN_URL" ] && run_link="<a href=\"${RUN_URL}\">${run_label}</a>"

cat > "$OUTPUT" << 'CSSBLOCK'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>VRT Report</title>
<link rel="stylesheet" href="https://unpkg.com/img-comparison-slider@8/dist/styles.css">
<script defer src="https://unpkg.com/img-comparison-slider@8/dist/index.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --sp-2xs:3px;--sp-xs:5px;--sp-sm:8px;--sp-md:13px;--sp-lg:21px;--sp-xl:34px;--sp-2xl:55px;
  --f-sans:'Inter',system-ui,sans-serif;--f-mono:'JetBrains Mono',ui-monospace,monospace;
  --c-bg:#ffffff;--c-surface:#f6f8fa;--c-surface-alt:#eaeef2;--c-border:#d0d7de;
  --c-text-1:#1f2328;--c-text-2:#656d76;--c-text-3:#8b949e;--c-accent:#0969da;
  --c-changed:#9a6700;--c-changed-s:rgba(154,103,0,.08);
  --c-passed:#1a7f37;--c-passed-s:rgba(26,127,55,.08);--c-diff-bg:#1b1b1f;
}
@media(prefers-color-scheme:dark){:root{
  --c-bg:#0d1117;--c-surface:#161b22;--c-surface-alt:#21262d;--c-border:#30363d;
  --c-text-1:#e6edf3;--c-text-2:#848d97;--c-text-3:#57606a;--c-accent:#2f81f7;
  --c-changed:#d97706;--c-changed-s:rgba(217,119,6,.09);
  --c-passed:#238636;--c-passed-s:rgba(35,134,54,.09);--c-diff-bg:#0e0e11;
}}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{color-scheme:light dark}html,body{height:100%;overflow:hidden}
body{font-family:var(--f-sans);background:var(--c-bg);color:var(--c-text-1);font-size:13px;line-height:1.618}
.shell{display:grid;grid-template-rows:48px 1fr;grid-template-columns:260px 1fr;height:100vh}
.toolbar{grid-column:1/-1;display:flex;align-items:center;gap:var(--sp-lg);padding:0 var(--sp-lg);background:var(--c-surface);border-bottom:1px solid var(--c-border);font-size:13px}
.toolbar-title{font-weight:500;color:var(--c-text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:1}
.toolbar-title a{color:var(--c-text-1);text-decoration:none}.toolbar-title a:hover{text-decoration:underline;color:var(--c-accent)}
.toolbar-meta{font-size:11px;color:var(--c-text-3);font-family:var(--f-mono);white-space:nowrap;flex-shrink:0}
.toolbar-meta a{color:var(--c-text-3);text-decoration:none}.toolbar-meta a:hover{color:var(--c-accent);text-decoration:underline}
.sidebar{background:var(--c-surface);border-right:1px solid var(--c-border);overflow-y:auto;padding:var(--sp-md) 0;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
.sidebar-section{padding:0 var(--sp-lg);margin-bottom:var(--sp-sm)}
.sidebar-label{display:flex;align-items:center;gap:var(--sp-xs);font-size:11px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:var(--c-text-3);padding:var(--sp-xs) 0}
.sidebar-label-count{font-size:10px;font-weight:600;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;border-radius:100px;padding:0 var(--sp-2xs);background:var(--c-surface-alt);color:var(--c-text-2)}
.sidebar-row{display:flex;align-items:center;gap:var(--sp-sm);height:40px;padding:0 var(--sp-lg);cursor:pointer;border-left:3px solid transparent;transition:background 80ms;font-size:13px;font-weight:500}
.sidebar-row:hover{background:var(--c-surface-alt)}.sidebar-row.active{background:var(--c-surface-alt);border-left-color:var(--c-accent)}
.sidebar-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.sidebar-dot--changed{background:var(--c-changed)}.sidebar-dot--passed{background:var(--c-passed)}
.sidebar-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sidebar-count{font-size:11px;font-weight:600;min-width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:100px;padding:0 var(--sp-xs);background:var(--c-changed-s);color:var(--c-changed)}
.main{overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--c-border) transparent}
.project-panel{display:none;height:100%;flex-direction:column}.project-panel.active{display:flex}
.panel-header{display:flex;align-items:center;gap:var(--sp-sm);padding:var(--sp-md) var(--sp-lg);border-bottom:1px solid var(--c-border);background:var(--c-surface);flex-shrink:0}
.panel-title{font-size:14px;font-weight:600;flex:1}
.pill{display:inline-flex;align-items:center;gap:var(--sp-xs);padding:2px var(--sp-sm);border-radius:100px;font-size:12px;font-weight:500;white-space:nowrap}
.pill::before{content:'';width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pill--changed{background:var(--c-changed-s);color:var(--c-changed)}.pill--changed::before{background:var(--c-changed)}
.pill--passed{background:var(--c-passed-s);color:var(--c-passed)}.pill--passed::before{background:var(--c-passed)}
.panel-nav{display:flex;gap:var(--sp-xs)}
.panel-nav button{width:28px;height:28px;border-radius:6px;border:1px solid var(--c-border);background:var(--c-surface-alt);color:var(--c-text-2);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:14px;transition:all 80ms}
.panel-nav button:hover{background:var(--c-border);color:var(--c-text-1)}
.diff-list{border-bottom:1px solid var(--c-border);background:var(--c-surface);flex-shrink:0}
.diff-row{display:flex;align-items:center;gap:var(--sp-sm);height:40px;padding:0 var(--sp-lg);cursor:pointer;font-family:var(--f-mono);font-size:12px;color:var(--c-text-2);border-left:3px solid transparent;transition:background 80ms}
.diff-row:hover{background:var(--c-surface-alt)}.diff-row.active{background:var(--c-bg);border-left-color:var(--c-changed);color:var(--c-text-1)}
.diff-row+.diff-row{border-top:1px solid var(--c-border)}
.diff-status{font-size:11px;color:var(--c-changed);font-weight:500;font-family:var(--f-sans);margin-left:auto}
.viewer{flex:1;overflow:auto;padding:var(--sp-lg);background:var(--c-bg)}
.viewer-toolbar{display:flex;align-items:center;gap:var(--sp-sm);margin-bottom:var(--sp-md)}
.viewer-path{font-family:var(--f-mono);font-size:12px;color:var(--c-text-2);flex:1}
.mode-tabs{display:inline-flex;border-radius:6px;overflow:hidden;border:1px solid var(--c-border)}
.mode-tab{font-size:12px;font-weight:500;font-family:var(--f-sans);padding:var(--sp-xs) var(--sp-md);border:none;cursor:pointer;background:var(--c-surface);color:var(--c-text-2);transition:all 80ms}
.mode-tab+.mode-tab{border-left:1px solid var(--c-border)}
.mode-tab:hover{color:var(--c-text-1)}.mode-tab.active{background:var(--c-accent);color:#fff}
.img-frame{border:1px solid var(--c-border);border-radius:8px;overflow:hidden;background:var(--c-surface-alt)}
.img-frame img{width:100%;display:block}
img-comparison-slider{--divider-width:2px;--divider-color:var(--c-accent);--handle-opacity:1;width:100%;outline:none}
img-comparison-slider img{width:100%;display:block}
.viewer-hint{display:flex;justify-content:space-between;margin-top:var(--sp-xs);font-size:11px;color:var(--c-text-3);font-family:var(--f-mono);letter-spacing:.04em;text-transform:uppercase}
.sbs{display:grid;grid-template-columns:1fr 1fr;gap:var(--sp-sm)}.sbs figure{margin:0}
.sbs figcaption{font-size:11px;font-family:var(--f-mono);color:var(--c-text-3);text-transform:uppercase;letter-spacing:.04em;margin-bottom:var(--sp-xs)}
.sbs .img-frame{border-radius:6px}
.v-pan{display:none}.v-pan.active{display:block}
.pass-panel{display:none;height:100%}.pass-panel.active{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:var(--sp-md)}
.pass-icon{width:48px;height:48px;color:var(--c-passed)}.pass-text{font-size:14px;color:var(--c-text-2)}
</style>
</head>
<body>
<div class="shell">
CSSBLOCK

# ── Toolbar ──
cat >> "$OUTPUT" << EOF
<div class="toolbar">
  <span class="toolbar-title">${pr_link}</span>
  <span class="toolbar-meta">${run_link}</span>
</div>
EOF

# ── Sidebar ──
cat >> "$OUTPUT" << EOF
<div class="sidebar">
  <div class="sidebar-section"><div class="sidebar-label">Changed <span class="sidebar-label-count">${CHANGED_COUNT}</span></div></div>
EOF

first_project=""
for example in $(printf '%s\n' "${CHANGED_EXAMPLES[@]}" | sort); do
  active_class=""
  if [ -z "$first_project" ]; then
    first_project="$example"
    active_class=" active"
  fi
  count="${EXAMPLE_DIFFS[$example]}"
  cat >> "$OUTPUT" << EOF
  <div class="sidebar-row${active_class}" onclick="selectProject('${example}',0)" data-project="${example}">
    <span class="sidebar-dot sidebar-dot--changed"></span>
    <span class="sidebar-name">${example}</span>
    <span class="sidebar-count">${count}</span>
  </div>
EOF
done

cat >> "$OUTPUT" << EOF
  <div class="sidebar-section" style="margin-top:var(--sp-md)"><div class="sidebar-label">Passed <span class="sidebar-label-count">${PASSED_COUNT}</span></div></div>
EOF

for example in $(printf '%s\n' "${PASSED_EXAMPLES[@]}" | sort); do
  active_class=""
  if [ -z "$first_project" ]; then
    first_project="$example"
    active_class=" active"
  fi
  cat >> "$OUTPUT" << EOF
  <div class="sidebar-row${active_class}" onclick="selectProject('${example}')" data-project="${example}">
    <span class="sidebar-dot sidebar-dot--passed"></span>
    <span class="sidebar-name">${example}</span>
  </div>
EOF
done

echo '</div>' >> "$OUTPUT"

# ── Main panels ──
echo '<div class="main">' >> "$OUTPUT"

# Changed example panels
for example in $(printf '%s\n' "${CHANGED_EXAMPLES[@]}" | sort); do
  count="${EXAMPLE_DIFFS[$example]}"
  artifact_dir="$RESULTS_DIR/vrt-results-${example}"
  active_class=""
  [ "$example" = "$first_project" ] && active_class=" active"

  cat >> "$OUTPUT" << EOF
<div class="project-panel${active_class}" data-panel="${example}">
  <div class="panel-header">
    <span class="panel-title">${example}</span>
    <span class="pill pill--changed" style="font-size:11px">${count} changed</span>
    <div class="panel-nav">
      <button onclick="navDiff(-1)" title="Previous">&#8249;</button>
      <button onclick="navDiff(1)" title="Next">&#8250;</button>
    </div>
  </div>
  <div class="diff-list">
EOF

  # Build diff rows
  diff_idx=0
  while IFS= read -r -d '' diff_file; do
    rel_path="${diff_file#*__diffs__/}"
    test_name="${rel_path%.png}"
    row_active=""
    [ "$diff_idx" -eq 0 ] && row_active=" active"
    cat >> "$OUTPUT" << EOF
    <div class="diff-row${row_active}" onclick="selectDiff(this,${diff_idx})" data-idx="${diff_idx}">${test_name}<span class="diff-status">Changed</span></div>
EOF
    diff_idx=$((diff_idx + 1))
  done < <(find "$artifact_dir" -path "*/__diffs__/*.png" -print0 2>/dev/null | sort -z)

  echo '  </div><div class="viewer">' >> "$OUTPUT"

  # Build viewer panels for each diff
  diff_idx=0
  while IFS= read -r -d '' diff_file; do
    rel_path="${diff_file#*__diffs__/}"
    test_name="${rel_path%.png}"
    baseline_file="${diff_file/__diffs__/__baselines__}"
    result_file="${diff_file/__diffs__/__results__}"
    pan_active=""
    [ "$diff_idx" -eq 0 ] && pan_active=" active"

    # Encode images
    bl_src=""; rs_src=""; df_src=""
    [ -f "$baseline_file" ] && bl_src="data:image/png;base64,$(b64_encode "$baseline_file")"
    [ -f "$result_file" ]   && rs_src="data:image/png;base64,$(b64_encode "$result_file")"
    df_src="data:image/png;base64,$(b64_encode "$diff_file")"

    cat >> "$OUTPUT" << EOF
    <div class="v-pan${pan_active}" data-diff="${diff_idx}">
      <div class="viewer-toolbar">
        <span class="viewer-path">${test_name}</span>
        <div class="mode-tabs">
          <button class="mode-tab active" onclick="setMode(this,'slider')">Slider</button>
          <button class="mode-tab" onclick="setMode(this,'sbs')">Side by Side</button>
          <button class="mode-tab" onclick="setMode(this,'diff')">Diff</button>
        </div>
      </div>
      <div data-mode="slider" style="display:block">
        <div class="img-frame"><img-comparison-slider><img slot="first" src="${bl_src}" alt="Baseline"><img slot="second" src="${rs_src}" alt="Result"></img-comparison-slider></div>
        <div class="viewer-hint"><span>Baseline</span><span>Result</span></div>
      </div>
      <div data-mode="sbs" style="display:none">
        <div class="sbs">
          <figure><figcaption>Baseline</figcaption><div class="img-frame"><img src="${bl_src}" alt="Baseline"></div></figure>
          <figure><figcaption>Result</figcaption><div class="img-frame"><img src="${rs_src}" alt="Result"></div></figure>
        </div>
      </div>
      <div data-mode="diff" style="display:none">
        <div class="img-frame" style="background:var(--c-diff-bg)"><img src="${df_src}" alt="Diff"></div>
        <div class="viewer-hint"><span>Pixel difference</span><span></span></div>
      </div>
    </div>
EOF
    diff_idx=$((diff_idx + 1))
  done < <(find "$artifact_dir" -path "*/__diffs__/*.png" -print0 2>/dev/null | sort -z)

  echo '  </div></div>' >> "$OUTPUT"
done

# Passed example panels
for example in $(printf '%s\n' "${PASSED_EXAMPLES[@]}" | sort); do
  active_class=""
  [ "$example" = "$first_project" ] && active_class=" active"
  cat >> "$OUTPUT" << EOF
<div class="pass-panel${active_class}" data-panel="${example}">
  <svg class="pass-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  <span class="pass-text">All snapshots match baseline.</span>
</div>
EOF
done

# Close main, shell, add JS
cat >> "$OUTPUT" << 'JSBLOCK'
</div></div>
<script>
function selectProject(name,diffIdx){
  document.querySelectorAll('.sidebar-row').forEach(r=>r.classList.toggle('active',r.dataset.project===name));
  document.querySelectorAll('.project-panel,.pass-panel').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
  if(typeof diffIdx==='number'){const p=document.querySelector('.project-panel[data-panel="'+name+'"]');if(p){const r=p.querySelector('.diff-row[data-idx="'+diffIdx+'"]');if(r)selectDiff(r,diffIdx);}}
}
function selectDiff(el,idx){
  const p=el.closest('.project-panel');
  p.querySelectorAll('.diff-row').forEach(r=>r.classList.toggle('active',+r.dataset.idx===idx));
  p.querySelectorAll('.v-pan').forEach(v=>v.classList.toggle('active',+v.dataset.diff===idx));
}
function navDiff(dir){
  const p=document.querySelector('.project-panel.active');if(!p)return;
  const rows=[...p.querySelectorAll('.diff-row')];
  const cur=rows.findIndex(r=>r.classList.contains('active'));
  const next=Math.max(0,Math.min(rows.length-1,cur+dir));
  selectDiff(rows[next],+rows[next].dataset.idx);
}
function setMode(btn,mode){
  const pan=btn.closest('.v-pan');
  pan.querySelectorAll('.mode-tab').forEach(t=>t.classList.toggle('active',t===btn));
  pan.querySelectorAll('[data-mode]').forEach(d=>d.style.display=d.dataset.mode===mode?'block':'none');
}
</script>
</body>
</html>
JSBLOCK

echo "Generated $OUTPUT with $TOTAL_DIFFS diff(s) across $CHANGED_COUNT example(s)."

# Generate diff summary markdown for PR comment
if [ "$HAS_DIFFS" = true ]; then
  {
    echo "| Example | Diffs |"
    echo "|---------|-------|"
    for example in $(printf '%s\n' "${!EXAMPLE_DIFFS[@]}" | sort); do
      echo "| ${example} | ${EXAMPLE_DIFFS[$example]} |"
    done
  } > "$DIFF_SUMMARY"
fi

echo "HAS_DIFFS=${HAS_DIFFS}" >> "$GITHUB_ENV"
