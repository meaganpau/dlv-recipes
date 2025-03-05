"use client"

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ComboboxProps = {
  list: {
    value: string
    label: string
  }[]
  hiddenItems?: string[]
  onSelect: (ingredient: string) => void
  placeholder?: string
  itemName?: string
  listRenderer?: (item: { value: string; label: string }) => React.ReactNode
}

export function Combobox({ list, hiddenItems, onSelect, placeholder, itemName, listRenderer }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No {itemName} found.</CommandEmpty>
            <CommandGroup>
              {/* If there's no more items, show a message */}
              {list.filter((item) => !hiddenItems?.includes(item.value)).length === 0 && (
                <CommandEmpty>No more items.</CommandEmpty>
              )}
              {list.filter((item) => !hiddenItems?.includes(item.value)).map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={(currentValue) => {
                    onSelect(currentValue)
                    setOpen(false)
                  }}
                >
                  {listRenderer ? listRenderer(item) : item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
