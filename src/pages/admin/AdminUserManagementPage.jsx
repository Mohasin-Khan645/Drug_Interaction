import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Search,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Lock,
  Plus,
  ArrowRight,
  KeyRound,
} from 'lucide-react';
import { userApi } from '../../api/userApi';
import { useNotifications } from '../../context/NotificationContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { formatDate } from '../../utils/formatters';

export default function AdminUserManagementPage() {
  const queryClient = useQueryClient();
  const { addToast } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState(null);
  const [deactivatingUser, setDeactivatingUser] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'DOCTOR',
    department: 'Internal Medicine',
    licenseNumber: '',
    status: 'ACTIVE',
  });

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await userApi.getUsers();
      return res.data || [];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: (userData) => userApi.createUser(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast({
        title: 'User Account Provisioned',
        message: `Account for ${newUser.name} created successfully. An activation invitation was dispatched.`,
        type: 'success',
      });
      setIsAddUserOpen(false);
      setNewUser({
        name: '',
        email: '',
        role: 'DOCTOR',
        department: 'Internal Medicine',
        licenseNumber: '',
        status: 'ACTIVE',
      });
    },
    onError: () => {
      addToast({
        title: 'Provisioning Error',
        message: 'Could not create user account. Please check inputs and try again.',
        type: 'danger',
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (userId) => userApi.resetUserPassword(userId),
    onSuccess: (_, userId) => {
      const targetUser = users.find((u) => u.id === userId);
      addToast({
        title: 'Password Reset Dispatched',
        message: `A secure one-time password reset link was dispatched to ${targetUser?.email || 'the user'}.`,
        type: 'info',
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast({ title: 'User Updated', message: 'User role and status updated.', type: 'success' });
      setEditingUser(null);
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => userApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      addToast({ title: 'Account Deactivated', message: 'User access has been suspended.', type: 'info' });
      setDeactivatingUser(null);
    },
  });

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (u) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{u.name}</span>
          <span className="text-3xs text-slate-400">{u.email}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (u) => (
        <Badge
          variant={
            u.role === 'ADMIN'
              ? 'purple'
              : u.role === 'DOCTOR'
              ? 'blue'
              : u.role === 'PHARMACIST'
              ? 'teal'
              : 'slate'
          }
          size="sm"
        >
          {u.role}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (u) => (
        <span
          className={`inline-flex items-center gap-1 text-2xs font-semibold ${
            u.status === 'ACTIVE' ? 'text-emerald-700' : 'text-red-700'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'
            }`}
          ></span>
          {u.status}
        </span>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      render: (u) => <span className="text-xs text-slate-600">{formatDate(u.createdAt)}</span>,
    },
    {
      header: 'Last Login',
      accessor: 'lastLogin',
      render: (u) => <span className="text-xs text-slate-600">{formatDate(u.lastLogin)}</span>,
    },
    {
      header: 'Actions',
      accessor: 'actions',
      headerClassName: 'text-right',
      cellClassName: 'text-right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditingUser(u)}
            className="text-xs text-slate-600"
          >
            Edit Role
          </Button>

          <button
            type="button"
            onClick={() => resetPasswordMutation.mutate(u.id)}
            title="Dispatch Temporary Password Reset Link"
            className="p-1 rounded text-slate-400 hover:text-teal-700 hover:bg-teal-50 transition-colors"
          >
            <KeyRound className="w-4 h-4" />
          </button>

          {u.status === 'ACTIVE' ? (
            <button
              type="button"
              onClick={() => setDeactivatingUser(u)}
              title="Deactivate account"
              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
            >
              <UserX className="w-4 h-4" />
            </button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateUserMutation.mutate({ id: u.id, data: { status: 'ACTIVE' } })}
              className="text-2xs"
            >
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 block mb-1">
            Access Control & RBAC
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            User Account Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer system roles, permissions, and status across clinical and administrative staff.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsAddUserOpen(true)}
          className="self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add System User
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full text-xs rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table columns={columns} data={filteredUsers} />

      {/* Edit Role Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Modify Role for ${editingUser.name}`}
          size="sm"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  updateUserMutation.mutate({
                    id: editingUser.id,
                    data: { role: editingUser.role, status: editingUser.status },
                  })
                }
                isLoading={updateUserMutation.isPending}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Select
              label="Assigned System Role"
              value={editingUser.role}
              onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
              options={[
                { value: 'PATIENT', label: 'Patient' },
                { value: 'DOCTOR', label: 'Doctor (MD)' },
                { value: 'PHARMACIST', label: 'Pharmacist (PharmD)' },
                { value: 'ADMIN', label: 'Administrator' },
              ]}
            />

            <Select
              label="Account Status"
              value={editingUser.status}
              onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
              options={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'DEACTIVATED', label: 'Deactivated' },
              ]}
            />
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      {isAddUserOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddUserOpen(false)}
          title="Provision New System User"
          size="md"
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAddUserOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (!newUser.name.trim() || !newUser.email.trim()) {
                    addToast({
                      title: 'Validation Notice',
                      message: 'Full name and clinical email address are required.',
                      type: 'warning',
                    });
                    return;
                  }
                  createUserMutation.mutate(newUser);
                }}
                isLoading={createUserMutation.isPending}
              >
                Provision User
              </Button>
            </>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newUser.name.trim() || !newUser.email.trim()) {
                addToast({
                  title: 'Validation Notice',
                  message: 'Full name and clinical email address are required.',
                  type: 'warning',
                });
                return;
              }
              createUserMutation.mutate(newUser);
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Legal Name"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="e.g. Dr. Marcus Brody"
              />
              <Input
                label="Clinical Email Address"
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="e.g. m.brody@hospital.org"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Assigned System Role"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                options={[
                  { value: 'DOCTOR', label: 'Doctor (MD / DO)' },
                  { value: 'PHARMACIST', label: 'Pharmacist (PharmD / RPh)' },
                  { value: 'ADMIN', label: 'Administrator' },
                  { value: 'PATIENT', label: 'Patient' },
                ]}
              />
              <Select
                label="Initial Account Status"
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                options={[
                  { value: 'ACTIVE', label: 'Active & Verified' },
                  { value: 'DEACTIVATED', label: 'Suspended / Inactive' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Clinical Department / Specialty"
                value={newUser.department}
                onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                placeholder="e.g. Cardiology, Inpatient Pharmacy"
              />
              <Input
                label="Medical License / Staff ID"
                value={newUser.licenseNumber}
                onChange={(e) => setNewUser({ ...newUser, licenseNumber: e.target.value })}
                placeholder="e.g. MD-84920"
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Deactivate Confirmation */}
      <ConfirmDialog
        isOpen={!!deactivatingUser}
        onClose={() => setDeactivatingUser(null)}
        onConfirm={() => deactivateMutation.mutate(deactivatingUser?.id)}
        title="Suspend Clinical User Account"
        description={`Are you sure you want to deactivate ${deactivatingUser?.name} (${deactivatingUser?.email})? They will immediately lose access to clinical patient records until reactivated.`}
        confirmText="Deactivate Account"
        variant="danger"
        isLoading={deactivateMutation.isPending}
      />
    </div>
  );
}
