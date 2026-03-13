<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Link 1: BASE_API/users -> Trả về tất cả users (Có thêm Số Thứ Tự ảo)
Route::get('/users', function () {
    // 1. Lấy dữ liệu và sắp xếp ID tăng dần
    $users = DB::table('users')->select('id', 'name')->orderBy('id', 'asc')->get();
    
    // 2. Phù phép thêm trường 'stt' (Số Thứ Tự) vào từng người dùng
    $formattedUsers = $users->map(function ($user, $index) {
        return [
            'stt' => $index + 1,   // Tự động đếm 1, 2, 3...
            'id' => $user->id,     // Giữ nguyên ID thật để code không lỗi
            'name' => $user->name
        ];
    });
    
    // 3. Trả về danh sách đã được làm đẹp
    return response()->json($formattedUsers)->header('Access-Control-Allow-Origin', '*');
});

// Link 2: BASE_API/users/{id} -> Trả về user có id tương ứng
Route::get('/users/{id}', function ($id) {
    $user = DB::table('users')->select('id', 'name')->where('id', $id)->first();
    
    if (!$user) {
        return response()->json(['message' => 'Không tìm thấy user'], 404)
                       ->header('Access-Control-Allow-Origin', '*');
    }
    
    // Thêm header cho phép CORS
    return response()->json($user)->header('Access-Control-Allow-Origin', '*');
});
// Link 3: Tạo mới user (CREATE)
Route::post('/users', function (\Illuminate\Http\Request $request) {
    $name = $request->input('name');
    DB::table('users')->insert(['name' => $name]);
    return response()->json(['message' => 'Thêm thành công'])->header('Access-Control-Allow-Origin', '*');
});

// Link 4: Cập nhật user (UPDATE)
Route::put('/users/{id}', function (\Illuminate\Http\Request $request, $id) {
    $name = $request->input('name');
    DB::table('users')->where('id', $id)->update(['name' => $name]);
    return response()->json(['message' => 'Sửa thành công'])->header('Access-Control-Allow-Origin', '*');
});

// Link 5: Xóa user (DELETE)
Route::delete('/users/{id}', function ($id) {
    DB::table('users')->where('id', $id)->delete();
    return response()->json(['message' => 'Xóa thành công'])->header('Access-Control-Allow-Origin', '*');
});
// Link bí mật để tự động tạo Database khi lên mạng
Route::get('/setup-db', function () {
    try {
        DB::statement("CREATE TABLE IF NOT EXISTS `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(255) NOT NULL,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
        
        DB::table('users')->insert([
            ['name' => 'Lê Huy Hoàng'],
            ['name' => 'Trần Thị Kim Yến']
        ]);
        return 'Chúc mừng cưng! Đã tạo Database và thêm dữ liệu thành công! 🎉';
    } catch (\Exception $e) {
        return 'Lỗi rồi: ' . $e->getMessage();
    }
});