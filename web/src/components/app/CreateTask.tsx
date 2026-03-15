import { Button, Dialog, Field, Input, Portal, Stack } from '@chakra-ui/react'
import { Plus, XIcon } from 'lucide-react'
import { useState } from 'react'
import DateTimePicker from '../ui/DateTimePicker'
import { CalendarDateTime, getLocalTimeZone } from '@internationalized/date'
import { API_URL } from '../../api'
import { toaster } from '../ui/toaster'

export default function CreateTask({
  setRefresh,
}: {
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
  })

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

  const [value, setValue] = useState<CalendarDateTime[]>([
    nowCalendarDateTime(),
  ])

  const handleAddTask = async () => {
    const iso =
      value.length > 0
        ? value[0].toDate(getLocalTimeZone()).toISOString()
        : null

    try {
      const resp = await fetch(`${API_URL}/tasks/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: '',
          due_date: iso,
          original_tz: 'Asia/Kolkata',
        }),
      })
      const data = await resp.json()
      if (resp.status != 200) {
        throw new Error(data.message ? data.message : 'could not create task')
      }
      toaster.create({
        title: 'task created',
        type: 'success',
        closable: true,
      })
      setRefresh((val) => !val)
    } catch (err) {
      if (err instanceof Error) {
        toaster.create({
          title: err.message,
          closable: true,
          type: 'error',
        })
      } else {
        toaster.create({
          title: 'could not create task',
          closable: true,
          type: 'error',
        })
      }
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
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </Field.Root>
                <DateTimePicker value={value} setValue={setValue} />
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="ghost">
                  <XIcon />
                </Button>
              </Dialog.CloseTrigger>
              <Button onClick={handleAddTask} colorPalette="blue">
                Save Task
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
