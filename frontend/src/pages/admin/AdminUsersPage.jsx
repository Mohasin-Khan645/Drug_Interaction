import { useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { adminApi } from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatDate } from '../../lib/format';
import { ROLES, ROLE_LABELS } from '../../lib/constants';
import { Card, CardBody, PageHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput, Select } from '../../components/ui/Input';
import { SearchInput } from '../../components/ui/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/ui/Feedback';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export default function AdminUsersPage() {
  const [term, setTerm] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [suspending, setSuspending] = useState(null);
  const debounced = useDebouncedValue(term, 300);
  const toast = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-users', { debounced, role, status, page }],
    queryFn: () =>
      adminApi.listUsers({
        search: debounced || undefined,
        role: role || undefined,
        status: status || undefined,
        page,
        limit: 10,
      }),
    placeholderData: keepPreviousData,
  });

  const update = useMutation({
    mutationFn: ({ userId, data }) => adminApi.updateUser(userId, data),
    onSuccess: () => {
      toast.success('User updated');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => toast.error('Update failed', errorMessage(error)),
  });

  const suspend = useMutation({
    mutationFn: (user) => adminApi.suspendUser(user.id),
    onSuccess: () => {
      toast.success('User suspended', 'The account can no longer sign in.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSuspending(null);
    },
    onError: (error) => toast.error('Could not suspend', errorMessage(error)),
  });

  const rows = (query.data && query.data.items) || [];

  return (
    <>
      <PageHeader
        title="Users"
        description="Accounts and roles. Role changes take effect on the user's next request."
        actions={
          <Button icon={UserPlus} onClick={() => setCreating(true)}>
            New user
          </Button>
        }
      />

      <Card>
        <CardBody className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <SearchInput
              label="Search"
              placeholder="Name or email"
              value={term}
              onChange={(value) => {
                setTerm(value);
                setPage(1);
              }}
            />
            <Select
              label="Role"
              value={role}
              placeholder="All roles"
              onChange={(event) => {
                setRole(event.target.value);
                setPage(1);
              }}
              options={Object.values(ROLES).map((value) => ({ value, label: ROLE_LABELS[value] }))}
            />
            <Select
              label="Status"
              value={status}
              placeholder="All statuses"
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              options={STATUSES.map((value) => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))}
            />
          </div>

          {query.isLoading && <LoadingSkeleton rows={4} />}
          {query.isError && <ErrorState description={errorMessage(query.error)} onRetry={query.refetch} />}

          <Table
            caption="Users"
            columns={[
              { key: 'name', header: 'Name', render: (row) => row.name },
              { key: 'email', header: 'Email', render: (row) => row.email },
              {
                key: 'role',
                header: 'Role',
                render: (row) => (
                  <Select
                    aria-label={`Role for ${row.name}`}
                    value={row.role}
                    onChange={(event) => update.mutate({ userId: row.id, data: { role: event.target.value } })}
                    options={Object.values(ROLES).map((value) => ({ value, label: ROLE_LABELS[value] }))}
                  />
                ),
              },
              { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
              { key: 'created', header: 'Created', render: (row) => formatDate(row.createdAt) },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={row.status === 'SUSPENDED'}
                    onClick={() => setSuspending(row)}
                  >
                    Suspend
                  </Button>
                ),
              },
            ]}
            rows={rows}
            getRowKey={(row) => row.id}
            empty={query.isSuccess ? <EmptyState title="No users" description="No account matched these filters." /> : null}
          />

          {query.data && <Pagination pagination={query.data.pagination} onPageChange={setPage} />}
        </CardBody>
      </Card>

      <CreateUserDialog open={creating} onClose={() => setCreating(false)} />

      <ConfirmDialog
        open={Boolean(suspending)}
        onClose={() => setSuspending(null)}
        onConfirm={() => suspend.mutate(suspending)}
        loading={suspend.isPending}
        variant="danger"
        title="Suspend this account?"
        confirmLabel="Suspend"
        description={
          suspending
            ? `${suspending.name} will be signed out and blocked from signing in. Their clinical records are retained.`
            : ''
        }
      />
    </>
  );
}

function CreateUserDialog({ open, onClose }) {
  const [values, setValues] = useState({ role: ROLES.PATIENT });
  const toast = useToast();
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: () => adminApi.createUser(values),
    onSuccess: () => {
      toast.success('User created');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setValues({ role: ROLES.PATIENT });
      onClose();
    },
    onError: (error) => toast.error('Could not create user', errorMessage(error)),
  });

  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));

  return (
    <Modal open={open} onClose={onClose} title="Create user">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          create.mutate();
        }}
      >
        <Input label="Name" required value={values.name || ''} onChange={set('name')} />
        <Input label="Email" type="email" required value={values.email || ''} onChange={set('email')} />
        <PasswordInput
          label="Temporary password"
          required
          value={values.password || ''}
          onChange={set('password')}
          hint="At least 12 characters with upper case, lower case and a digit."
        />
        <Select
          label="Role"
          value={values.role}
          onChange={set('role')}
          options={Object.values(ROLES).map((value) => ({ value, label: ROLE_LABELS[value] }))}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={create.isPending}>
            Create
          </Button>
        </div>
      </form>
    </Modal>
  );
}
