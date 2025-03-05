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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Star, X } from "lucide-react";
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { Combobox } from '@/components/Combobox';
import { useDebouncedCallback } from 'use-debounce';


import '@/styles/DataTable.scss'

interface RecipesTableProps {
  data: Recipe[]
  ingredients: Ingredient[]
}

export default function RecipesTable({ data, ingredients }: RecipesTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')

  const memoizedData = useMemo(() => data, [data])

  // Render Type cell with image and name
  const renderType = useCallback((type: Recipe['type']) => {
    return (
      <div className='flex items-center gap-2'>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={type.image_url} alt={type.name} className='w-6' />
        <span>{type.name}</span>
      </div>
    )
  }, [])

  const renderStars = useCallback((stars: Recipe['stars']) => {
    return (
      <div className='flex items-center pl-3'>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} size={12} fill={ index < stars ? '#2A344F' : '#ccc'} strokeWidth={0}/>
        ))}
      </div>
    )
  }, [])

  // Render Ingredients cell
  const renderIngredients = useCallback(
    (recipeIngredients: Recipe['ingredients'], name: string) => {
      const Ingredient = (ingredient: Ingredient) => {
        return (
          <div className='flex flex-wrap gap-2' key={ingredient.id}>
            <div className='flex items-center gap-1'>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ingredient.image_url} alt={ingredient.name} />
              <span>{ingredient.name}</span>
            </div>
          </div>
        )
      }

      const getGenericImageUrl = (type: Ingredient['ingredient_type']) => {
        return ingredients.find(ing => {
          return ing.ingredient_type === type && ing.is_generic
        })?.image_url
      }

      const getIngredientTypeByName = (name: Ingredient['name']) => {
        return ingredients.find(ing => {
          return ing.name === name
        })?.ingredient_type
      }

      const getGenericImageUrlByIngredient = (ingredient: Ingredient) => {
        return getGenericImageUrl(getIngredientTypeByName(ingredient.name))
      }

      const getGenericNameByIngredient = (ingredient: Ingredient) => {
        const type = getIngredientTypeByName(ingredient.name)
        return ingredients.find(ing => {
          return ing.ingredient_type === type && ing.is_generic
        })?.name
      }

      return (
        <div className='ingredients gap-2'>
          {recipeIngredients.map(ingredient =>
            // if ingredient is an array, it means it's an optional ingredient
            Array.isArray(ingredient) ? (
              <div
                className='optional-ingredient-container gap-2 border rounded-md p-1'
                key={name + ingredient.toString()}
              >
                <div className='optional-ingredient-header flex items-center gap-2'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getGenericImageUrlByIngredient(ingredient[0])}
                    alt={getGenericNameByIngredient(ingredient[0])}
                  />
                  <b>One of:</b>
                </div>
                <div className='optional-ingredient-list gap-2'>
                  {ingredient.map(ing => (
                    <Ingredient {...ing} key={ing.id} />
                  ))}
                </div>
              </div>
            ) : (
              <Ingredient {...ingredient} key={ingredient.id} />
            )
          )}
        </div>
      )
    },
    [ingredients]
  )

  const columns: ColumnDef<Recipe>[] = useMemo(
    () => [
      {
        accessorKey: 'image_url',
        header: () => <div className='w-12'></div>,
        cell: ({ row }) => {
          const image_url = row.getValue('image_url')
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image_url as string}
              alt={row.original.name}
              style={{ maxHeight: '3rem', maxWidth: '3rem', height: 'auto', width: 'auto' }}
            />
          )
        }
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Recipe name
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const name = row.getValue('name')
          return <div className='font-medium'>{name as string}</div>
        }
      },
      {
        accessorKey: 'type',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Type
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const type = row.getValue('type')
          return renderType(type as Recipe['type'])
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue) {
            return true
          }

          const type = row.original.type.name
          return type === filterValue
        }
      },
      {
        accessorKey: 'stars',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Stars
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => renderStars(row.original.stars)
      },
      {
        accessorKey: 'energy',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Energy
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const energy = row.getValue('energy')
          const formattedNumber = new Intl.NumberFormat().format(energy as number)
          return <div className='font-medium pl-4 flex items-center gap-1'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://dreamlightvalleywiki.com/images/a/a9/Energy.png" alt="Energy" style={{
              maxHeight: '18px'
            }} />
            +{formattedNumber}
          </div>
        }
      },
      {
        accessorKey: 'sell_price',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Sell price
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const sell_price = row.getValue('sell_price')
          const formattedNumber = new Intl.NumberFormat().format(sell_price as number)
          return <div className='font-medium pl-5 flex items-center gap-1'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://dreamlightvalleywiki.com/images/2/2f/Star_Coin_icon.png" alt="Star Coin" style={{
              maxHeight: '16px'
            }} />
            {formattedNumber}
          </div>
        }
      },
      {
        accessorKey: 'ingredients',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Ingredients
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const ingredients = row.getValue('ingredients')
          return renderIngredients(ingredients as Ingredient[], row.original.name)
        },
        filterFn: (row, _columnId, filterValue) => {
          if (!filterValue || filterValue.length === 0) {
            return true
          }

          const ingredients = row.original.ingredients
          return filterValue.every((ingredient: string) => {
            return ingredients.some(ing => {
              if (Array.isArray(ing)) {
                return ing.some(i => i.name === ingredient)
              }
              return ing.name === ingredient
            })
          })
        },
        sortingFn: (rowA, rowB) => {
          // first sort by number of ingredients, then by name of ingredient
          const a = rowA.original.ingredients
          const b = rowB.original.ingredients
          // if the number of ingredients is the same, sort by name of ingredient
          const numberOfIngredientsA = () => {
            const optionalIngredientLength = Array.isArray(a[0]) ? a[0].length : 0
            return a.length + optionalIngredientLength
          }
          const numberOfIngredientsB = () => {
            const optionalIngredientLength = Array.isArray(b[0]) ? b[0].length : 0
            return b.length + optionalIngredientLength
          }

          // Do a secondary sort based on first ingredient name
          if (numberOfIngredientsA() === numberOfIngredientsB()) {
            return (b[0] || b[0][0]).name.localeCompare((a[0] || a[0][0]).name)
          }
          return numberOfIngredientsB() - numberOfIngredientsA()
        }
      },
      {
        accessorKey: 'collection',
        header: ({ column }) => {
          return (
            <Button variant='ghost' onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
              Collection
              {column.getIsSorted() === false && <ArrowUpDown className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'asc' && <ArrowUp className='ml-2 h-4 w-4' />}
              {column.getIsSorted() === 'desc' && <ArrowDown className='ml-2 h-4 w-4' />}
            </Button>
          )
        },
        cell: ({ row }) => {
          const collection = row.getValue('collection')
          return <div className='font-medium'>{collection as string}</div>
        }
      }
    ],
    [renderIngredients, renderType, renderStars]
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
  const types = [...new Set(data.map(recipe => recipe.type.name))]
  const collections = [...new Set(data.map(recipe => recipe.collection))]

  const EmptyRow = () => {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className='h-24 text-center'>
          No recipes found. 😕
        </TableCell>
      </TableRow>
    )
  }

  const debouncedSearch = useDebouncedCallback((value) => {
    table.getColumn('name')?.setFilterValue(value)
  }, 200);

  return (
    <div className='space-y-4'>
      <div className='gap-4'>
        <Input
          placeholder='Search recipes...'
          value={searchTerm}
          onChange={event => {
            setSearchTerm(event.target.value)
            debouncedSearch(event.target.value)
          }}
          className='max-w-sm text-sm'
        />
        <div className='mt-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                Type: {(table.getColumn('type')?.getFilterValue() as string) ?? 'All'}{' '}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => table.getColumn('type')?.setFilterValue(null)}>All</DropdownMenuItem>
              {types.map(type => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => table.getColumn('type')?.setFilterValue(type)}
                >
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='mt-1'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline'>
                Collection: {(table.getColumn('collection')?.getFilterValue() as string) ?? 'All'}{' '}
                <ChevronDown className='ml-2 h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => table.getColumn('collection')?.setFilterValue(null)}>All</DropdownMenuItem>
              {collections.map(collection => (
                <DropdownMenuItem
                  key={collection}
                  onClick={() => table.getColumn('collection')?.setFilterValue(collection)}
                >
                  {collection}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className='flex gap-4 mt-1'>
          <Combobox
            list={ingredients.map(ingredient => ({
              value: ingredient.name,
              label: ingredient.name,
              image_url: ingredient.image_url
            }))}
            hiddenItems={table.getColumn('ingredients')?.getFilterValue() as string[]}
            onSelect={ingredient => {
              const currentFilterValue = table.getColumn('ingredients')?.getFilterValue() as string[]
              const updatedFilterValue = [...(currentFilterValue || []), ingredient]
              table.getColumn('ingredients')?.setFilterValue(updatedFilterValue)
            }}
            placeholder='Select ingredients...'
            listRenderer={(item) => (
              <div className='flex items-center gap-2'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ingredients.find(ing => ing.name === item.value)?.image_url} alt={item.label} className="w-4" />
                {item.label}
              </div>
            )}
            itemName='ingredients'
          />
          <div>
            {(table.getColumn('ingredients')?.getFilterValue() as string[])?.map(ingredient => (
              <div key={ingredient} className='flex items-center gap-2 border rounded-md p-1 w-fit'>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ingredients.find(ing => ing.name === ingredient)?.image_url}
                  alt={ingredient}
                  className='h-4'
                />
                <span className='text-sm'>{ingredient}{' '}</span>
                <span
                  onClick={() => {
                    const currentFilterValue = table.getColumn('ingredients')?.getFilterValue() as string[]
                    const updatedFilterValue = currentFilterValue?.filter(i => i !== ingredient)
                    table.getColumn('ingredients')?.setFilterValue(updatedFilterValue)
                  }}
                >
                  <X className='w-4 h-4 cursor-pointer' />
                </span>
              </div>
            ))}
          </div>
        </div>
        <Button
          className='mt-2'
          size='sm'
          variant='default'
          onClick={() => {
            setSearchTerm('')
            table.setColumnFilters(null)
            table.setSorting([])
          }}
        >
          Clear filters
        </Button>
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
