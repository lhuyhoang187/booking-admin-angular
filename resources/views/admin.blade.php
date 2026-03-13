<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quản lý người dùng</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">

<div class="container mt-5" style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
    
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-primary fw-bold">Quản lý người dùng</h2>
        <a href="/users" target="_blank" class="btn btn-outline-info">Xem JSON API</a>
    </div>

    <form id="addForm" class="d-flex mb-4">
        <input type="text" id="newName" class="form-control me-3" placeholder="Nhập họ tên người dùng..." required>
        <button type="submit" class="btn btn-primary px-4">Thêm mới</button>
    </form>

    <table class="table table-bordered align-middle">
        <thead class="table-dark">
            <tr>
                <th width="10%">ID</th>
                <th width="60%">Họ và Tên</th>
                <th width="30%" class="text-center">Thao tác</th>
            </tr>
        </thead>
        <tbody id="userTable">
            </tbody>
    </table>

</div>

<script>
    const apiUrl = '/users'; // Gọi thẳng vào cửa API nhà mình

    // Hàm lấy danh sách và in ra bảng
    function loadUsers() {
        fetch(apiUrl)
            .then(res => res.json())
            .then(users => {
                const tbody = document.getElementById('userTable');
                tbody.innerHTML = '';
                users.forEach((user, index) => {
                    tbody.innerHTML += `
                        <tr>
                            <td class="fw-bold">#${index + 1}</td>
                            <td>${user.name}</td>
                            <td class="text-center">
                                <button class="btn btn-success btn-sm me-2" onclick="editUser(${user.id}, '${user.name}')">Sửa</button>
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteUser(${user.id})">Xóa</button>
                            </td>
                        </tr>
                    `;
                });
            });
    }

    // Hàm Thêm mới
    document.getElementById('addForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const nameInput = document.getElementById('newName');
        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nameInput.value })
        }).then(() => {
            nameInput.value = ''; // Xóa ô nhập
            loadUsers(); // Cập nhật lại bảng
        });
    });

    // Hàm Xóa
    function deleteUser(id) {
        if(confirm('Cưng có chắc chắn muốn xóa người này không?')) {
            fetch(`${apiUrl}/${id}`, { method: 'DELETE' })
                .then(() => loadUsers());
        }
    }

    // Hàm Sửa
    function editUser(id, oldName) {
        const newName = prompt('Nhập tên mới thay cho: ' + oldName, oldName);
        if(newName && newName !== oldName) {
            fetch(`${apiUrl}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            }).then(() => loadUsers());
        }
    }

    // Khi trang web vừa mở lên thì gọi hàm lấy dữ liệu luôn
    loadUsers();
</script>

</body>
</html>