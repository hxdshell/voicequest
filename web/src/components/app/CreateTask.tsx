import { Button, Dialog, Field, Input, Portal, Stack } from '@chakra-ui/react'
import { Plus, XIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import DateTimePicker from '../ui/DateTimePicker'
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date'
import { API_URL } from '../../api'
import { toaster } from '../ui/toaster'

type CreateTaskForm = {
  title: string
  description: string
  due_date: CalendarDateTime[]
  original_tz: string
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

export default function CreateTask({
  setRefresh,
}: {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { register, handleSubmit, control, reset } = useForm<CreateTaskForm>({
    defaultValues: {
      title: '',
      description: '',
      due_date: [nowCalendarDateTime()],
      original_tz: getLocalTimeZone(),
    },
  })

  function formatCalendarDateTimes(dt: CalendarDateTime): string {
    const year = dt.year
    const month = String(dt.month).padStart(2, '0')
    const day = String(dt.day).padStart(2, '0')
    const hour = String(dt.hour).padStart(2, '0')
    const min = String(dt.minute).padStart(2, '0')
    return `${year}-${month}-${day} ${hour}:${min}`
  }

  const onSubmit = async (form: CreateTaskForm) => {
    const formatted = formatCalendarDateTimes(form.due_date[0])

    try {
      const resp = await fetch(`${API_URL}/tasks/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          due_date: formatted,
        }),
      })

      const data = await resp.json()

      if (resp.status !== 200) {
        throw new Error(data.message ?? 'could not create task')
      }

      toaster.create({
        title: 'task created',
        type: 'success',
        closable: true,
      })

      setRefresh((v) => !v)
      reset()
    } catch (err) {
      toaster.create({
        title: err instanceof Error ? err.message : 'could not create task',
        type: 'error',
        closable: true,
      })
    } finally {
      setIsAddOpen(false)
    }
  }

  return (
    <Dialog.Root open={isAddOpen} onOpenChange={(e) => setIsAddOpen(e.open)}>
      <Dialog.Trigger asChild>
        <Button size="sm" p={2} variant="solid">
          <Plus size={10} style={{ marginRight: '1px' }} /> Add Task
        </Button>
      </Dialog.Trigger>

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
                  <Field.Label>Task Title</Field.Label>
                  <Input
                    placeholder="What needs to be done?"
                    {...register('title')}
                  />
                </Field.Root>

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
