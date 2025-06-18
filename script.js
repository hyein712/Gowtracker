let totalHours = parseFloat(localStorage.getItem('totalHours')) || 0;
let dailyData = JSON.parse(localStorage.getItem('dailyData')) || {};

// ✅ 소수점을 '시간 + 분'으로 바꾸는 함수
function formatTime(decimalHours) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}시간 ${minutes}분`;
}

// ✅ 시계 그리기
function drawClock(percent) {
  const canvas = document.getElementById('progressClock');
  const ctx = canvas.getContext('2d');
  const radius = canvas.width / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 회색 배경 원
  ctx.beginPath();
  ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI);
  ctx.fillStyle = '#eee';
  ctx.fill();

  // 파란 원호 (12시 방향 시작 → 시계 방향)
  ctx.beginPath();
  ctx.moveTo(radius, radius);
  ctx.arc(
    radius,
    radius,
    radius - 10,
    -Math.PI / 2,
    -Math.PI / 2 + 2 * Math.PI * percent,
    false
  );
  ctx.fillStyle = '#3498db';
  ctx.fill();
}

// ✅ 입력 받고 누적 처리
function updateProgress() {
  const hours = parseFloat(document.getElementById('studyHours').value) || 0;
  const minutes = parseFloat(document.getElementById('studyMinutes').value) || 0;
  const newHours = hours + minutes / 60;

  // 오늘 날짜 기준 저장
  const today = new Date().toISOString().split('T')[0];
  if (!dailyData[today]) dailyData[today] = 0;
  dailyData[today] += newHours;

  // 누적 반영
  totalHours += newHours;
  localStorage.setItem('totalHours', totalHours.toFixed(2));
  localStorage.setItem('dailyData', JSON.stringify(dailyData));

  // 입력창 초기화
  document.getElementById('studyHours').value = '';
  document.getElementById('studyMinutes').value = '';

  updateDisplay();
}

// ✅ 누적 시간 등 표시 업데이트
function updateDisplay() {
  document.getElementById('totalHours').textContent = formatTime(totalHours);
  document.getElementById('remainingHours').textContent = formatTime(10000 - totalHours);
  drawClock(totalHours / 10000);
  updateLog();
  updateChart();
}

// ✅ 하루별 기록 리스트 업데이트
function updateLog() {
  const log = document.getElementById('dailyLog');
  log.innerHTML = '';
  const sortedDates = Object.keys(dailyData).sort().reverse();
  for (let date of sortedDates) {
    const li = document.createElement('li');
    li.textContent = `${date}: ${formatTime(dailyData[date])}`;
    log.appendChild(li);
  }
}

// ✅ 날짜별 차트 업데이트
function updateChart() {
  const ctx = document.getElementById('dailyChart').getContext('2d');
  const labels = Object.keys(dailyData).sort();
  const data = labels.map(date => dailyData[date]);

  if (window.myChart) window.myChart.destroy();

  window.myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: '공부 시간 (시간)',
        data: data,
        backgroundColor: '#3498db'
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// ✅ 첫 진입 시 화면 표시
updateDisplay();
