import { UserStatusSelect } from "@/components/admin/UserStatusSelect";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUsers } from "@/services/admin.service";
import { formatDate } from "@/utils/formatDate";
export default async function AdminUsersPage() {
  const [current, users] = await Promise.all([
    getCurrentUser(),
    getAdminUsers(),
  ]);
  return (
    <div>
      <h1 className="admin-page-title">Người dùng và phân quyền</h1>
      <p className="admin-page-subtitle">
        Gán vai trò và kiểm soát trạng thái truy cập bằng các nút thao tác rõ
        ràng.
      </p>
      <section className="admin-card mt-6">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Điện thoại</th>
                <th>Đơn hàng</th>
                <th>Ngày tạo</th>
                <th>Vai trò</th>
                <th>Trạng thái hoạt động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <strong>{user.name}</strong>
                    <small className="block text-slate-400">{user.email}</small>
                  </td>
                  <td>{user.phone ?? "—"}</td>
                  <td>{user.orderCount}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <UserStatusSelect
                      disabled={current?.id === user.id}
                      id={user.id}
                      mode="role"
                      role={user.role}
                      status={user.status}
                    />
                    {current?.id === user.id ? (
                      <small className="mt-1 block text-slate-400">
                        Tài khoản hiện tại
                      </small>
                    ) : null}
                  </td>
                  <td>
                    <UserStatusSelect
                      disabled={current?.id === user.id}
                      id={user.id}
                      mode="status"
                      role={user.role}
                      status={user.status}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
