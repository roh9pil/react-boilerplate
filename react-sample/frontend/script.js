document.addEventListener('DOMContentLoaded', () => {
    const tableListContainer = document.getElementById('table-list');
    const paginationControlsContainer = document.getElementById('pagination-controls');
    const tableDetailView = document.getElementById('table-detail-view');
    const backToListBtn = document.getElementById('back-to-list-btn');
    const currentTableNameElem = document.getElementById('current-table-name');
    const llmTableDescriptionElem = document.getElementById('llm-table-description');
    const userTableDescriptionElem = document.getElementById('user-table-description');
    const columnListContainer = document.getElementById('column-list');
    const saveProgressBtn = document.getElementById('save-progress-btn');
    const markCompletedBtn = document.getElementById('mark-completed-btn');

    // 새로 추가된 검색 및 필터링 요소
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    const applyFilterBtn = document.getElementById('apply-filter-btn');

    let currentTableName = null; // 현재 보고 있는 테이블 이름
    let currentPage = 1;

    // 테이블 목록 불러오기
    async function fetchTables(page = 1) {
        currentPage = page;
        // 검색어와 필터 값 가져오기
        const searchQuery = searchInput.value;
        const selectedStatus = statusFilter.value;

        // 쿼리 파라미터 생성
        const params = new URLSearchParams();
        if (searchQuery) {
            params.append('search', searchQuery);
        }
        if (selectedStatus && selectedStatus !== 'all') {
            params.append('status', selectedStatus);
        }
        params.append('page', page);
        params.append('per_page', 10); // 페이지당 10개 항목

        const queryString = params.toString();
        const url = `/tables?${queryString}`;

        try {
            const response = await fetch(url); // 수정된 URL 사용
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            displayTables(data.tables);
            displayPagination(data);
        } catch (error) {
            console.error('테이블 목록을 불러오는 데 실패했습니다:', error);
            tableListContainer.innerHTML = '<p style="color: red;">테이블 목록을 불러올 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.</p>';
        }
    }

    // 테이블 목록 표시
    function displayTables(tables) {
        tableListContainer.innerHTML = ''; // 기존 목록 비우기
        if (tables.length === 0) {
            tableListContainer.innerHTML = '<p>표시할 테이블이 없습니다. 데이터베이스에 스키마 정보가 있는지 확인하세요.</p>';
            return;
        }
        tables.forEach(table => {
            const tableItem = document.createElement('div');
            tableItem.classList.add('table-item');
            tableItem.innerHTML = `
                <h4>${table.table_name}</h4>
                <p>상태: <span class="table-status status-${table.status}">${getStatusText(table.status)}</span></p>
                <p>최근 업데이트: ${table.last_updated ? new Date(table.last_updated).toLocaleString() : 'N/A'}</p>
            `;
            tableItem.addEventListener('click', () => showTableDetails(table.table_name));
            tableListContainer.appendChild(tableItem);
        });
    }

    // 페이지네이션 컨트롤 표시
    function displayPagination(data) {
        paginationControlsContainer.innerHTML = '';
        if (data.total_pages <= 1) return;

        const prevButton = document.createElement('button');
        prevButton.textContent = '이전';
        prevButton.disabled = !data.has_prev;
        prevButton.addEventListener('click', () => fetchTables(data.current_page - 1));
        paginationControlsContainer.appendChild(prevButton);

        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` ${data.current_page} / ${data.total_pages} `;
        paginationControlsContainer.appendChild(pageInfo);

        const nextButton = document.createElement('button');
        nextButton.textContent = '다음';
        nextButton.disabled = !data.has_next;
        nextButton.addEventListener('click', () => fetchTables(data.current_page + 1));
        paginationControlsContainer.appendChild(nextButton);
    }

    // 상태 텍스트 변환 헬퍼
    function getStatusText(status) {
        switch (status) {
            case 'pending': return '미검토';
            case 'in_progress': return '검토 중';
            case 'completed': return '검토 완료';
            case 'missing': return '정보 누락'; // 새롭게 추가된 컬럼 등
            default: return status;
        }
    }

    // 특정 테이블 상세 정보 표시
    async function showTableDetails(tableName) {
        currentTableName = tableName;
        document.querySelector('.table-list-container').style.display = 'none';
        tableDetailView.style.display = 'block';
        currentTableNameElem.textContent = tableName;

        try {
            const response = await fetch(`/tables/${tableName}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            llmTableDescriptionElem.value = data.llm_table_description || '';
            userTableDescriptionElem.value = data.user_table_description || '';

            displayColumns(data.columns);

        } catch (error) {
            console.error(`테이블 '${tableName}' 상세 정보를 불러오는 데 실패했습니다:`, error);
            alert(`테이블 상세 정보를 불러올 수 없습니다: ${error.message}`);
        }
    }

    // 컬럼 목록 표시
    function displayColumns(columns) {
        columnListContainer.innerHTML = '';
        if (columns.length === 0) {
            columnListContainer.innerHTML = '<p>이 테이블에는 컬럼 정보가 없습니다.</p>';
            return;
        }
        columns.forEach(col => {
            const columnItem = document.createElement('div');
            columnItem.classList.add('column-item');
            columnItem.innerHTML = `
                <h4>${col.column_name} <span style="font-weight: normal; color: #888;">(${col.data_type})</span></h4>
                <label for="llm-col-desc-${col.column_name}">LLM이 생성한 설명:</label>
                <textarea id="llm-col-desc-${col.column_name}" rows="3" readonly>${col.llm_description || ''}</textarea>
                
                <label for="user-col-desc-${col.column_name}">사용자 수정 설명:</label>
                <textarea id="user-col-desc-${col.column_name}" rows="3" 
                          data-column-name="${col.column_name}"
                          data-status="${col.status}"
                >${col.user_description || ''}</textarea>
            `;
            columnListContainer.appendChild(columnItem);
        });
    }

    // 임시 저장 또는 완료 저장
    async function saveDescriptions(status) {
        if (!currentTableName) return;

        const userTableDescription = userTableDescriptionElem.value;
        const columnsData = [];
        document.querySelectorAll('#column-list textarea[data-column-name]').forEach(textarea => {
            const columnName = textarea.dataset.columnName;
            const currentStatus = textarea.dataset.status; // 현재 상태 가져오기
            columnsData.push({
                column_name: columnName,
                user_description: textarea.value,
                // 'completed'로 저장할 경우, 모든 컬럼도 'completed'로 표시
                status: status === 'completed' ? 'completed' : currentStatus // 'in_progress' 또는 현재 상태 유지
            });
        });

        try {
            const response = await fetch(`/tables/${currentTableName}/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_table_description: userTableDescription,
                    status: status, // 'in_progress' or 'completed'
                    columns: columnsData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.error}`);
            }

            const result = await response.json();
            alert(result.message);
            // 저장 후 테이블 목록을 새로고침하여 상태 변경 확인
            backToList(); 
        } catch (error) {
            console.error('설명 저장 실패:', error);
            alert(`설명 저장에 실패했습니다: ${error.message}`);
        }
    }

    // 테이블 목록으로 돌아가기
    function backToList() {
        currentTableName = null;
        tableDetailView.style.display = 'none';
        document.querySelector('.table-list-container').style.display = 'block';
        fetchTables(currentPage); // 목록 새로고침
    }

    // 이벤트 리스너
    backToListBtn.addEventListener('click', backToList);
    saveProgressBtn.addEventListener('click', () => saveDescriptions('in_progress'));
    markCompletedBtn.addEventListener('click', () => saveDescriptions('completed'));

    // 검색 및 필터링 이벤트 리스너 추가
    applyFilterBtn.addEventListener('click', () => fetchTables(1)); // '적용' 버튼 클릭 시 첫 페이지부터 다시 불러오기
    // (선택 사항) 검색 입력창에서 Enter 키 누르면 필터링
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchTables(1);
        }
    });

    // 초기 로드
    fetchTables();
});
