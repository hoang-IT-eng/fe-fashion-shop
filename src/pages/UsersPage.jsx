import { useState, useEffect } from 'react'
import './UsersPage.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const AVATAR_COLORS = [
    'linear-gradient(135deg,#7a5aff,#9d7fff)',
    'linear-gradient(135deg,#22d3a0,#06b884)',
    'linear-gradient(135deg,#ff6b6b,#ff5a5a)',
    'linear-gradient(135deg,#ffd166,#ffbe33)',
    'linear-gradient(135deg,#4ecdc4,#2db9b0)',
    'linear-gradient(135deg,#f093fb,#c649d2)',
    'linear-gradient(135deg,#4facfe,#2d8af0)',
    'linear-gradient(135deg,#43e97b,#1db954)',
    'linear-gradient(135deg,#fa709a,#ee0979)',
    'linear-gradient(135deg,#a18cd1,#fbc2eb)',
]

function getInitial(name) {
    return name ? name.trim().split(' ').pop().charAt(0).toUpperCase() : '?'
}

function getColor(id) {
    return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]
}

// ── Toast Notification ──────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast-${t.type}`}>
                    <span>{t.type === 'success' ? '✅' : '❌'}</span>
                    {t.msg}
                </div>
            ))}
        </div>
    )
}

// ── Modal Form (Create / Edit) ──────────────────────────────
function FormModal({ mode, user, onClose, onSave }) {
    const [name, setName] = useState(user?.name || '')
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return setErr('Tên không được để trống')
        if (name.trim().length < 2) return setErr('Tên phải có ít nhất 2 ký tự')
        setErr('')
        setLoading(true)
        await onSave(name.trim())
        setLoading(false)
    }

    return (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal">
                <div className="modal-header">
                    <span className="modal-title">{mode === 'create' ? '➕ Thêm người dùng' : '✏️ Chỉnh sửa'}</span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Họ và tên</label>
                        <input
                            className={`form-input ${err ? 'form-input-error' : ''}`}
                            placeholder="Nhập họ và tên..."
                            value={name}
                            onChange={e => { setName(e.target.value); setErr('') }}
                            autoFocus
                        />
                        {err && <div className="form-error">⚠️ {err}</div>}
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-ghost" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? '⏳ Đang lưu...' : (mode === 'create' ? '➕ Thêm' : '💾 Lưu')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ── Confirm Delete Modal ─────────────────────────────────────
function ConfirmModal({ user, onClose, onConfirm }) {
    const [loading, setLoading] = useState(false)
    return (
        <div className="modal-overlay open" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal modal-sm">
                <div className="modal-header">
                    <span className="modal-title">🗑️ Xác nhận xóa</span>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="confirm-body">
                    <div className="confirm-avatar" style={{ background: getColor(user.id) }}>
                        {getInitial(user.name)}
                    </div>
                    <p>Bạn chắc chắn muốn xóa <strong>{user.name}</strong>?</p>
                    <p className="confirm-warn">Hành động này không thể hoàn tác!</p>
                </div>
                <div className="form-actions">
                    <button className="btn-ghost" onClick={onClose}>Hủy</button>
                    <button
                        className="btn-danger"
                        disabled={loading}
                        onClick={async () => { setLoading(true); await onConfirm(); setLoading(false) }}
                    >
                        {loading ? '⏳ Đang xóa...' : '🗑️ Xóa'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// ── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
    const [users, setUsers] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [search, setSearch] = useState('')
    const [modal, setModal] = useState(null) // { type: 'create'|'edit'|'delete', user? }
    const [toasts, setToasts] = useState([])

    // Toast helper
    const toast = (msg, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, msg, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }

    // Fetch all
    const fetchUsers = async () => {
        setLoading(true); setError(null)
        try {
            const res = await fetch(`${API_BASE}/users`)
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()
            setUsers(data); setFiltered(data)
        } catch (e) { setError(e.message) }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchUsers() }, [])

    useEffect(() => {
        const q = search.toLowerCase().trim()
        setFiltered(q ? users.filter(u => u.name.toLowerCase().includes(q) || String(u.id).includes(q)) : users)
    }, [search, users])

    // CREATE
    const handleCreate = async (name) => {
        try {
            const res = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            await fetchUsers()
            setModal(null)
            toast(`Đã thêm "${name}" thành công!`)
        } catch (e) { toast(`Lỗi: ${e.message}`, 'error') }
    }

    // UPDATE
    const handleUpdate = async (name) => {
        try {
            const res = await fetch(`${API_BASE}/users/${modal.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            await fetchUsers()
            setModal(null)
            toast(`Đã cập nhật thành công!`)
        } catch (e) { toast(`Lỗi: ${e.message}`, 'error') }
    }

    // DELETE
    const handleDelete = async () => {
        try {
            const res = await fetch(`${API_BASE}/users/${modal.user.id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            await fetchUsers()
            setModal(null)
            toast(`Đã xóa "${modal.user.name}" thành công!`)
        } catch (e) { toast(`Lỗi: ${e.message}`, 'error') }
    }

    return (
        <div className="up-root">
            <div className="up-bg" />
            <Toast toasts={toasts} />

            {/* Header */}
            <header className="up-header">
                <div className="up-header-inner">
                    <div className="up-logo">
                        <div className="up-logo-icon">👗</div>
                        <span className="up-logo-text">Fashion Shop</span>
                    </div>
                    <div className="up-nav-badge">🟢 PostgreSQL</div>
                </div>
            </header>

            <main className="up-main">
                {/* Hero */}
                <div className="up-hero">
                    <div className="up-eyebrow"><span className="up-dot" />Hệ thống đang hoạt động</div>
                    <h1 className="up-h1">Quản Lý Người Dùng</h1>
                    <p className="up-desc">Thêm, chỉnh sửa, xóa người dùng trong cơ sở dữ liệu PostgreSQL.</p>
                </div>

                {/* Stats */}
                <div className="up-stats">
                    {[
                        { icon: '👥', value: loading ? '—' : users.length, label: 'Tổng users' },
                        { icon: '🗄️', value: 'PG', label: 'PostgreSQL', color: '#22d3a0' },
                        { icon: '🔌', value: 'CRUD', label: 'API đầy đủ', color: '#ffd166', small: true },
                    ].map((s, i) => (
                        <div className="up-stat-chip" key={i}>
                            <span>{s.icon}</span>
                            <div>
                                <div className="up-stat-value" style={s.color ? { color: s.color, fontSize: s.small ? 14 : undefined } : {}}>{s.value}</div>
                                <div className="up-stat-label">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="up-toolbar">
                    <div className="up-search-wrap">
                        <span className="up-search-icon">🔍</span>
                        <input className="up-search" placeholder="Tìm kiếm theo tên..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn-ghost-sm" onClick={fetchUsers} disabled={loading}>🔄 Làm mới</button>
                    <button className="btn-primary" onClick={() => setModal({ type: 'create' })}>➕ Thêm user</button>
                </div>

                {/* Table */}
                <div className="up-table-container">
                    <div className="up-table-header">
                        <div className="up-table-title">
                            Danh sách người dùng
                            <span className="up-count-badge">{loading ? '—' : filtered.length}</span>
                        </div>
                        <div className="up-table-api">REST API /users</div>
                    </div>

                    {error ? (
                        <div className="up-empty">
                            <div className="up-empty-icon">⚠️</div>
                            <h3 style={{ color: '#ff5a5a' }}>Không thể kết nối API</h3>
                            <p>{error}</p>
                            <button className="btn-primary" style={{ marginTop: 16 }} onClick={fetchUsers}>🔄 Thử lại</button>
                        </div>
                    ) : loading ? (
                        <table className="up-table">
                            <thead><tr><th>ID</th><th>Họ và tên</th><th>Thao tác</th></tr></thead>
                            <tbody>{[1, 2, 3, 4, 5].map(i => (
                                <tr key={i}>
                                    <td><div className="up-skeleton" style={{ width: 36, height: 28 }} /></td>
                                    <td><div className="up-skeleton" style={{ width: 200, height: 28 }} /></td>
                                    <td><div className="up-skeleton" style={{ width: 130, height: 28, marginLeft: 'auto' }} /></td>
                                </tr>
                            ))}</tbody>
                        </table>
                    ) : filtered.length === 0 ? (
                        <div className="up-empty">
                            <div className="up-empty-icon">🔍</div>
                            <h3>Không tìm thấy người dùng</h3>
                            <p>Thử thay đổi từ khóa hoặc <button className="link-btn" onClick={() => setModal({ type: 'create' })}>thêm mới</button></p>
                        </div>
                    ) : (
                        <table className="up-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 60 }}>ID</th>
                                    <th>Họ và tên</th>
                                    <th style={{ textAlign: 'right', width: 160 }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((user, idx) => (
                                    <tr key={user.id} style={{ animationDelay: `${idx * 0.04}s` }}>
                                        <td><span className="up-id-badge">{user.id}</span></td>
                                        <td>
                                            <div className="up-user-cell">
                                                <div className="up-avatar" style={{ background: getColor(user.id) }}>{getInitial(user.name)}</div>
                                                <div>
                                                    <div className="up-user-name">{user.name}</div>
                                                    <div className="up-user-sub">ID #{user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="action-group">
                                                <button className="btn-edit" onClick={() => setModal({ type: 'edit', user })}>✏️ Sửa</button>
                                                <button className="btn-del" onClick={() => setModal({ type: 'delete', user })}>🗑️</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </main>

            <footer className="up-footer">
                <p>Fashion Shop © 2025 — <span style={{ color: '#7a5aff' }}>NestJS</span> + <span style={{ color: '#22d3a0' }}>PostgreSQL</span> + <span style={{ color: '#ffd166' }}>React</span></p>
            </footer>

            {/* Modals */}
            {modal?.type === 'create' && (
                <FormModal mode="create" onClose={() => setModal(null)} onSave={handleCreate} />
            )}
            {modal?.type === 'edit' && (
                <FormModal mode="edit" user={modal.user} onClose={() => setModal(null)} onSave={handleUpdate} />
            )}
            {modal?.type === 'delete' && (
                <ConfirmModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDelete} />
            )}
        </div>
    )
}
