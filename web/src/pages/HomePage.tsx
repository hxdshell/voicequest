import { useEffect, useMemo, useState } from 'react'
import {
  Table,
  Button,
  Dialog,
  Input,
  Stack,
  Field,
  IconButton,
  HStack,
  Text,
  Center,
  Spinner,
  Box,
} from '@chakra-ui/react'
import { Pencil, Trash2 } from 'lucide-react'
import Mic from '../components/app/Mic'
import { useNavigate } from '@tanstack/react-router'
import CreateTask from '../components/app/CreateTask'
import { client } from '../api'
import { toaster } from '../components/ui/toaster'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(false)

  // Dialog/Form States
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate({ to: 'auth', replace: true })
    }
    async function fetchTasks() {
      try {
        setLoading(true)
        const resp = await client.get('/tasks')
        setTasks(resp.data)
      } catch (err) {
        if (err instanceof Error) {
          toaster.create({
            closable: true,
            title: err.message,
            type: 'error',
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchTasks()
  }, [refresh])

  const memoizedTasks = useMemo(() => {
    return tasks
  }, [tasks, refresh])

  const handleUpdateTask = async () => {}

  if (loading)
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    )
  return (
    <Stack gap="6" p="8" maxWidth="1000px" mx="auto">
      <Box padding={'1rem'}>
        <Mic setRefresh={setRefresh} />
      </Box>
      <HStack justify="space-between">
        <Text fontSize="xl" fontWeight="bold">
          Task Log
        </Text>
        <CreateTask setRefresh={setRefresh} />
      </HStack>

      <Table.ScrollArea borderWidth={'1px'} height="260px">
        <Table.Root size="sm" interactive stickyHeader>
          <Table.Header p="1rem" bg="red">
            <Table.Row bg="bg.subtle" fontWeight={'bold'} fontSize={'md'}>
              <Table.ColumnHeader p={2} color="purple.500">
                Name
              </Table.ColumnHeader>
              <Table.ColumnHeader p={2} color="purple.500">
                Status
              </Table.ColumnHeader>
              <Table.ColumnHeader p={2} color="purple.500">
                Due Date
              </Table.ColumnHeader>
              <Table.ColumnHeader p={2} color="purple.500">
                Edit
              </Table.ColumnHeader>
              <Table.ColumnHeader p={2} color="purple.500">
                Delete
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {memoizedTasks.map((task) => (
              <Table.Row key={task.id}>
                <Table.Cell p={2}>{task.title}</Table.Cell>
                <Table.Cell p={2}>{task.status}</Table.Cell>
                <Table.Cell p={2}>{task.due_date}</Table.Cell>
                <Table.Cell p={2}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTask(task)
                      setFormData({
                        title: task.title,
                      })
                    }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                </Table.Cell>
                <Table.Cell p={2}>
                  <IconButton
                    variant="ghost"
                    size="sm"
                    colorPalette="red"
                    // onClick={() => setDeletingTaskId(task.id)}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>

      {/* Edit Dialog */}
      <Dialog.Root
        open={!!editingTask}
        onOpenChange={(e) => !e.open && setEditingTask(null)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Update Task</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap="4">
                <Field.Root>
                  <Field.Label>Task Title</Field.Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setEditingTask(null)}>
                Cancel
              </Button>
              <Button colorPalette="blue" onClick={handleUpdateTask}>
                Update
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog.Root
        open={!!deletingTaskId}
        onOpenChange={(e) => !e.open && setDeletingTaskId(null)}
        role="alertdialog"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Delete Task</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant="outline" onClick={() => setDeletingTaskId(null)}>
                Cancel
              </Button>
              {/* <Button colorPalette="red" onClick={handleDeleteTask}>
                Delete
              </Button> */}
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Stack>
  )
}
