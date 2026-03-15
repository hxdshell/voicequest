import {
  Button,
  createListCollection,
  Dialog,
  Field,
  Input,
  Portal,
  Select,
  Stack,
} from '@chakra-ui/react'
import { XIcon } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import DateTimePicker from '../ui/DateTimePicker'
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date'
import { API_URL } from '../../api'
import { toaster } from '../ui/toaster'
import { useEffect } from 'react'

type UpdateTaskForm = {
  title: string
  description: string
  due_date: CalendarDateTime[]
  original_tz: string
  status: string[]
}

const statusCollection = createListCollection({
  items: [
    { label: 'Pending', value: '0' },
    { label: 'Delayed', value: '1' },
    { label: 'Completed', value: '2' },
    { label: 'Cancelled', value: '3' },
  ],
})

function toCalendarDateTime(dateStr: string): CalendarDateTime {
  const d = new Date(dateStr)
  return new CalendarDateTime(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  )
}

function nowCalendarDateTime() {
  const d = new Date()
  return new CalendarDateTime(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
  )
}

export default function UpdateTask({
  task,
  setTask,
  setRefresh,
}: {
  task: Task | null
  setTask: React.Dispatch<React.SetStateAction<Task | null>>
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const { register, handleSubmit, control, reset } = useForm<UpdateTaskForm>({
    defaultValues: {
      title: task?.title ? task?.title : '',
      description: task?.description ? task?.description : '',
      due_date: [
        task?.due_date
          ? toCalendarDateTime(task?.due_date)
          : nowCalendarDateTime(),
      ],
      original_tz: getLocalTimeZone(),
      status: task?.status ? [String(task.status)] : ['0'],
    },
  })

  useEffect(() => {
    if (!task) return

    reset({
      title: task.title ?? '',
      description: task.description ?? '',
      due_date: [
        task.due_date
          ? toCalendarDateTime(task.due_date)
          : nowCalendarDateTime(),
      ],
      original_tz: getLocalTimeZone(),
      status: task?.status ? [String(task.status)] : ['0'],
    })
  }, [task, reset])

  function formatCalendarDateTimes(dt: CalendarDateTime): string {
    const year = dt.year
    const month = String(dt.month).padStart(2, '0')
    const day = String(dt.day).padStart(2, '0')
    const hour = String(dt.hour).padStart(2, '0')
    const min = String(dt.minute).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${min}`
  }

  const onSubmit = async (form: UpdateTaskForm) => {
    const formatted = formatCalendarDateTimes(form.due_date[0])
    console.log({
      ...form,
      status: Number(form.status[0]),
      due_date: formatted,
    })
    try {
      const resp = await fetch(`${API_URL}/tasks/update/${task?.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          status: Number(form.status[0]),
          due_date: formatted,
        }),
      })

      const data = await resp.json()

      if (resp.status !== 200) {
        throw new Error(data.message ?? 'could not update task')
      }

      toaster.create({
        title: 'task update',
        type: 'success',
        closable: true,
      })

      setRefresh((v) => !v)
      reset()
      setTask(null)
    } catch (err) {
      toaster.create({
        title: err instanceof Error ? err.message : 'could not create task',
        type: 'error',
        closable: true,
      })
    }
  }

  return (
    <Dialog.Root open={!!task} onOpenChange={(e) => !e.open && setTask(null)}>
      {/* <Dialog.Trigger asChild>
        <Button size="sm" p={2} variant="solid">
          <Plus size={10} style={{ marginRight: '1px' }} /> Add Task
        </Button>
      </Dialog.Trigger> */}

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header bg="bg.subtle">
              <Dialog.Title color="purple.500">Create New Task</Dialog.Title>
            </Dialog.Header>

            <Dialog.Body>
              <Stack gap="5">
                <Field.Root>
                  <Field.Label>Title</Field.Label>
                  <Input
                    placeholder="What needs to be done?"
                    {...register('title')}
                  />
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Input
                    placeholder="Describe this task"
                    {...register('description')}
                  />
                </Field.Root>

                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <Select.Root
                      collection={statusCollection}
                      value={field.value}
                      onValueChange={(e) => field.onChange(e.value)}
                    >
                      <Select.HiddenSelect />
                      <Select.Label>Status</Select.Label>
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder="Select status" />
                        </Select.Trigger>
                      </Select.Control>

                      <Select.Positioner>
                        <Select.Content>
                          {statusCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Select.Root>
                  )}
                />
                <Controller
                  control={control}
                  name="due_date"
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value}
                      setValue={field.onChange}
                    />
                  )}
                />
              </Stack>
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost">
                  <XIcon />
                </Button>
              </Dialog.CloseTrigger>

              <Button onClick={handleSubmit(onSubmit)} colorPalette="blue">
                Save Task
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
