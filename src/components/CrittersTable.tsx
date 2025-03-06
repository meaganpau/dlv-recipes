'use client'

import React, { useCallback, useMemo } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, Clock } from "lucide-react";
import { useDebouncedCallback } from 'use-debounce';
import { Critter } from '@/types/critter';
import { DAY_OPTIONS, HOUR_OPTIONS } from '@/utils/constants';
import { convert12HourTo24Hour, convert24HourTo12Hour, getIsAvailableAtTime, getIsAvailableOnDay } from '@/utils/time-utils';
import { trackEvent } from '@/lib/analytics';

import '@/styles/DataTable.scss'

interface CrittersTableProps {
  data: Critter[]
}

export default function CrittersTable({ data }: CrittersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const [typeFilterIsAll, setTypeFilterIsAll] = React.useState<boolean>(false)
  const [locationFilterIsAll, setLocationFilterIsAll] = React.useState<boolean>(false)

  const memoizedData = useMemo(() => data, [data])
  
  const renderLocation = useCallback((location: Critter['location']) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <div className='font-medium flex items-center gap-2 pl-2'><img src={location.image_url} alt={location.name} className='w-6' />{location.name}</div>
  }, [])

  const renderSchedule = useCallback((schedule: Critter['schedule']) => {
    return <div className='font-medium'><ol>{DAY_OPTIONS.map((day) => {
      const time = schedule[day.toLowerCase() as keyof Critter['schedule']]      
      const isNotAvailable = time === false
      return <li key={day} className={isNotAvailable ? 'text-gray-300 italic' : 'text-gray-700'}><span className='font-bold'>{day}:</span> {typeof time === 'boolean' ? time ? 'All day' : 'N/A' : time}</li>
    })}</ol></div>
  }, [])

  const columns: ColumnDef<Critter>[] = useMemo(
    () => [
      {
        accessorKey: 'image_url',
        header: () => <div></div>,
        cell: ({ row }) => {
          const image_url = row.getValue('image_url')
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url as string}
              alt={row.original.name}
              style={{ marginLeft: 'auto', marginRight: 'auto', maxWidth: '50px', maxHeight: '50px', height: 'auto', width: 'auto' }}
            />
          )
        }
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => {
              const isSorted = column.getIsSorted()
              column.toggleSorting(isSorted === 'asc')
              trackEvent({ action: 'sort', category: 'critters_table', label: `name:${isSorted === 'asc' ? 'asc' : 'desc'}` })
            }}>
              Critter name
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const name = row.getValue('name')
          return <div className='font-medium pl-4'>{name as string}</div>
        }
      },
      {
        accessorKey: 'type',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => {
              const isSorted = column.getIsSorted()
              column.toggleSorting(isSorted === 'asc')
              trackEvent({ action: 'sort', category: 'critters_table', label: `type:${isSorted === 'asc' ? 'asc' : 'desc'}` })
            }}>
              Type
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const type = row.getValue('type')
          return <div className='font-medium pl-4'>{type as string}</div>
        }
      },
      {
        accessorKey: 'location',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => {
              const isSorted = column.getIsSorted()
              column.toggleSorting(isSorted === 'asc')
              trackEvent({ action: 'sort', category: 'critters_table', label: `location:${isSorted === 'asc' ? 'asc' : 'desc'}` })
            }}>
              Location
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const location = row.getValue('location')
          return renderLocation(location as Critter['location'])
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue) {
            return true
          }

          const location = row.original.location.name
          return location === filterValue
        }
      },
      {
        accessorKey: 'schedule',
        header: 'Schedule',
        cell: ({ row }) => {
          const schedule = row.getValue('schedule')
          return renderSchedule(schedule as Critter['schedule'])
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue) {
            return true
          }

          let isAvailableOnDay: boolean, isAvailableAtTime: boolean
          const [{ day, hour, minute }] = filterValue
          const schedule = row.original.schedule

          if (!day) {
            isAvailableOnDay = true
          }

          if (!hour && hour !== 0) {
            isAvailableAtTime = true
          }

          if (day) {
            isAvailableOnDay = getIsAvailableOnDay(schedule, day)
          }

          if (hour || hour === 0) {
            isAvailableAtTime = getIsAvailableAtTime(schedule, day, hour, minute)
          }

          return isAvailableOnDay && isAvailableAtTime
        }
      }
    ],
    [renderLocation, renderSchedule]
  )

  const table = useReactTable({
    data: memoizedData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters
    }
  })

  // Extract unique types for filter dropdown
  const locations = [...new Set(data.map(critter => critter.location.name))]
  const types = [...new Set(data.map(critter => critter.type))]

  const EmptyRow = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className='h-24 text-center'>
          No critters found. 🐾
        </TableCell>
      </TableRow>
    )
  }

  const debouncedSearch = useDebouncedCallback((value) => {
    table.getColumn('name')?.setFilterValue(value)
    trackEvent({ action: 'search', category: 'critters_table', label: value })
  }, 200);

  return (
    <div className='space-y-4'>
      <div className='gap-4'>
        <Input
          placeholder='Search critters...'
          value={searchTerm}
          onChange={event => {
            setSearchTerm(event.target.value)
            debouncedSearch(event.target.value)
          }}
          className='w-60 sm:w-[400px] text-sm'
        />
        <div className='flex flex-col gap-0 sm:flex-row sm:gap-2'>
          <div className='mt-1'>
            <Select value={typeFilterIsAll ? 'all' : table.getColumn('type')?.getFilterValue() as string || ''} onValueChange={(value) => {
              if (!value) {
                table.getColumn('type')?.setFilterValue(null)
                setTypeFilterIsAll(false)
              } else if (value === 'all') {
                table.getColumn('type')?.setFilterValue(null)
                setTypeFilterIsAll(true)
                trackEvent({ action: 'filter', category: 'critters_table', label: 'type:all' })
              } else {
                table.getColumn('type')?.setFilterValue(value)
                setTypeFilterIsAll(false)
                trackEvent({ action: 'filter', category: 'critters_table', label: `type:${value}` })
              }
            }}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select type' />
              </SelectTrigger>
              <SelectContent className='max-h-[240px] overflow-y-auto'>
                <SelectItem value='all'>Any type</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='mt-1'>
            <Select value={locationFilterIsAll ? 'all' : table.getColumn('location')?.getFilterValue() as string || ''} onValueChange={(value) => {
              if (!value) {
                table.getColumn('location')?.setFilterValue(null)
                setLocationFilterIsAll(false)
              } else if (value === 'all') {
                table.getColumn('location')?.setFilterValue(null)
                setLocationFilterIsAll(true)
                trackEvent({ action: 'filter', category: 'critters_table', label: 'location:all' })
              } else {
                table.getColumn('location')?.setFilterValue(value)
                setLocationFilterIsAll(false)
                trackEvent({ action: 'filter', category: 'critters_table', label: `location:${value}` })
              }
            }}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select location' />
              </SelectTrigger>
              <SelectContent className='max-h-[240px] overflow-y-auto'>
                <SelectItem value='all'>Any location</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex flex-col gap-0 sm:flex-row sm:gap-2'>
          <div className='mt-1'>
            <Select 
              value={table.getColumn('schedule')?.
                getFilterValue()?.[0]?.hour === null ? 'all' : 
                  (typeof table.getColumn('schedule')?.getFilterValue()?.[0]?.hour === 'number') ? 
                  convert24HourTo12Hour(table.getColumn('schedule')?.getFilterValue()?.[0]?.hour) : 
                  table.getColumn('schedule')?.getFilterValue()?.[0]?.hour === 'all-day' ? 'all-day' : ''}
              onValueChange={(value) => {
                if (!value) {
                  table.getColumn('schedule')?.setFilterValue(null)
                } else if (value === 'all') {
                  table.getColumn('schedule')?.setFilterValue([{
                    day: table.getColumn('schedule')?.getFilterValue()?.[0]?.day,
                    hour: null,
                    minute: table.getColumn('schedule')?.getFilterValue()?.[0]?.minute || 0
                  }])
                  trackEvent({ action: 'filter', category: 'critters_table', label: `schedule:hour:all` })
                } else if (value === 'all-day') {
                  table.getColumn('schedule')?.setFilterValue([{
                    day: table.getColumn('schedule')?.getFilterValue()?.[0]?.day,
                    hour: 'all-day',
                    minute: table.getColumn('schedule')?.getFilterValue()?.[0]?.minute || 0
                  }])
                  trackEvent({ action: 'filter', category: 'critters_table', label: `schedule:hour:all-day` })
                } else {
                  table.getColumn('schedule')?.setFilterValue([{
                    day: table.getColumn('schedule')?.getFilterValue()?.[0]?.day,
                    hour: convert12HourTo24Hour(value),
                    minute: table.getColumn('schedule')?.getFilterValue()?.[0]?.minute || 0
                  }])
                  trackEvent({ action: 'filter', category: 'critters_table', label: `schedule:hour:${value}` })
                }
              }}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select hour' />
              </SelectTrigger>
              <SelectContent className='max-h-[240px] overflow-y-auto'>
                <SelectItem value='all'>Any hour</SelectItem>
                <SelectItem value='all-day'>All day only</SelectItem>
                {HOUR_OPTIONS.map(hour => (
                  <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='mt-1'>
            <Select value={table.getColumn('schedule')?.getFilterValue()?.[0]?.day === null ? 'all' : table.getColumn('schedule')?.getFilterValue()?.[0]?.day || ''} onValueChange={(value) => {
              if (!value) {
                table.getColumn('schedule')?.setFilterValue(null)
              } else if (value === 'all') {
                table.getColumn('schedule')?.setFilterValue([{
                  day: null,
                  hour: table.getColumn('schedule')?.getFilterValue()?.[0]?.hour,
                  minute: table.getColumn('schedule')?.getFilterValue()?.[0]?.minute || 0
                }])
                trackEvent({ action: 'filter', category: 'critters_table', label: `schedule:day:all` })
              } else {
                table.getColumn('schedule')?.setFilterValue([{
                  day: value,
                  hour: table.getColumn('schedule')?.getFilterValue()?.[0]?.hour,
                  minute: table.getColumn('schedule')?.getFilterValue()?.[0]?.minute || 0
                }])
                trackEvent({ action: 'filter', category: 'critters_table', label: `schedule:day:${value}` })
              }
            }}>
              <SelectTrigger className='w-[240px]'>
                <SelectValue placeholder='Select day' />
              </SelectTrigger>
              <SelectContent className='max-h-[240px] overflow-y-auto'>
                <SelectItem value='all'>Any day</SelectItem>
                {DAY_OPTIONS.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='flex flex-col gap-0 mt-1 sm:mt-2 sm:flex-row sm:gap-2 critter-buttons-container'>
          <Button
            className='mt-2 main-button'
            variant='default'
            onClick={() => {
              const currentTime = new Date()
              const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' })
              const currentHour = currentTime.getHours()
              const currentMinute = currentTime.getMinutes()

              table.getColumn('schedule')?.setFilterValue([{
                day: currentDay,
                hour: currentHour,
                minute: currentMinute
              }])
              trackEvent({ action: 'available_now', category: 'critters_table' })
            }}
          >
            <Clock />Available Now
          </Button>
          <Button
            className='mt-1'
            size='sm'
            variant='default'
            onClick={() => {
              setSearchTerm('')
              table.setColumnFilters(null)
              table.setSorting([])
              setTypeFilterIsAll(false)
              setLocationFilterIsAll(false)
              trackEvent({ action: 'clear_filters', category: 'critters_table' })
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow
              key={headerGroup.id}
              className='w-full'
            >
              {headerGroup.headers.map(header => {
                return (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className='w-full'
              >
                {row.getVisibleCells().map(cell => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <EmptyRow />
          )}
        </TableBody>
      </Table>
    </div>
  )
}
