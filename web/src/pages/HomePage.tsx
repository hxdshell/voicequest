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
} from '@chakra-ui/react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { taskService, type Task } from '../api/task'

export default function HomePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog/Form States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
  })

  useEffect(() => {
    taskService
      .getAll()
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [])

  const memoizedTasks = useMemo(() => {
    // You can also add sorting logic here: tasks.sort((a,b) => ...)
    return tasks
  }, [tasks])

  const handleAddTask = async () => {
    try {
      // API CALL
      const newTask = await taskService.create({ ...formData, status: 'Todo' })
      setTasks((prev) => [...prev, newTask])
      setIsAddOpen(false)
      setFormData({ title: '' })
    } catch (err) {
      console.error('Failed to create', err)
    }
  }

  const handleUpdateTask = async () => {
    if (!editingTask) return
    try {
      // API CALL
      const updated = await taskService.update(editingTask.id, formData)
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? updated : t)),
      )
      setEditingTask(null)
    } catch (err) {
      console.error('Failed to update', err)
    }
  }

  // const handleDeleteTask = async () => {
  //   if (!deletingTaskId) return
  //   try {
  //     // API CALL
  //     await taskService.delete(deletingTaskId)
  //     setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId))
  //     setDeletingTaskId(null)
  //   } catch (err) {
  //     console.error('Failed to delete', err)
  //   }
  // }

  if (loading)
    return (
      <Center h="200px">
        <Spinner />
      </Center>
    )
  return (
    <Stack gap="6" p="8" maxWidth="1000px" mx="auto">
      <HStack justify="space-between">
        <Text fontSize="2xl" fontWeight="bold">
          Task Manager
        </Text>
        <Dialog.Root
          open={isAddOpen}
          onOpenChange={(e) => setIsAddOpen(e.open)}
        >
          <Dialog.Trigger asChild>
            <Button colorPalette="blue" variant="solid">
              <Plus size={16} style={{ marginRight: '8px' }} /> Add Task
            </Button>
          </Dialog.Trigger>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Create New Task</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap="4">
                  <Field.Root>
                    <Field.Label>Task Title</Field.Label>
                    <Input
                      placeholder="What needs to be done?"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </Field.Root>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Dialog.CloseTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.CloseTrigger>
                <Button onClick={handleAddTask} colorPalette="blue">
                  Save Task
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </HStack>

      <Table.ScrollArea borderWidth="1px" borderRadius="md">
        <Table.Root variant="line" interactive>
          <Table.Header>
            <Table.Row bg="bg.subtle">
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader textAlign="end">Due Date</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {memoizedTasks.map((task) => (
              <Table.Row key={task.id}>
                <Table.Cell>{task.id}</Table.Cell>
                <Table.Cell fontWeight="medium">{task.title}</Table.Cell>
                <Table.Cell>{task.status}</Table.Cell>
                <Table.Cell textAlign="end">
                  <HStack justify="flex-end" gap="2">
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
                    <IconButton
                      variant="ghost"
                      size="sm"
                      colorPalette="red"
                      // onClick={() => setDeletingTaskId(task.id)}
                    >
                      <Trash2 size={16} />
                    </IconButton>
                  </HStack>
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
