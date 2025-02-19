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
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, X } from "lucide-react";
import { Recipe } from '@/types/recipe';
import { Ingredient } from '@/types/ingredient';
import { Combobox } from '@/components/Combobox';

interface DataTableProps {
  data: Recipe[];
  ingredients: Ingredient[];
}

export default function DataTable({ data, ingredients }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const memoizedData = useMemo(() => data, [data])

  const columns: ColumnDef<Recipe>[] = useMemo(() => [
    {
      accessorKey: "image_url",
      header: () => <div className="w-12"></div>,
      cell: ({ row }) => {
        const image_url = row.getValue("image_url")
        return <img src={image_url as string} alt={row.original.name} style={{ maxHeight: '3rem', maxWidth: '3rem', height: 'auto', width: 'auto'}} />
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )},
      cell: ({ row }) => {
        const name = row.getValue("name")
        return <div className="font-medium">{name as string}</div>
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Type
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )},
      cell: ({ row }) => {        
        const type = row.getValue("type")
        return renderType(type as Recipe['type'])
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        if (!filterValue) {
          return true;
        }
        
        const type = row.original.type.name;
        return type === filterValue;
      },
    },
    {
      accessorKey: "stars",
      header: ({ column }) => { return (
        <Button 
        variant="ghost" 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Stars
        {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
        {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
        {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
      </Button>
    )},
      cell: ({ row }) => {
        const stars = row.getValue("stars")
        return <div className="font-medium">{stars as number}</div>
      },
    },
    {
      accessorKey: "energy",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Energy
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )},
      cell: ({ row }) => {
        const energy = row.getValue("energy")
        return <div className="font-medium">{energy as number}</div>
      },
    },
    {
      accessorKey: "sell_price",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sell Price
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )},
      cell: ({ row }) => {
        const sell_price = row.getValue("sell_price")
        return <div className="font-medium">{sell_price as number}</div>
      },
    },
    {
      accessorKey: "ingredients",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Ingredients
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
      )},
      cell: ({ row }) => {
        const ingredients = row.getValue("ingredients")
        return renderIngredients(ingredients as Ingredient[], row.original.id)
      },
      filterFn: (row, columnId, filterValue, addMeta) => {
        if (!filterValue || filterValue.length === 0) {
          return true;
        }
        
        const ingredients = row.original.ingredients;
        return filterValue.every((ingredient: string) => {
          return ingredients.some((ing) => {
            if (Array.isArray(ing)) {
              return ing.some((i) => i.name === ingredient);
            }
            return ing.name === ingredient;
          });
        });
      },
      sortingFn: (rowA, rowB, columnId) => {
        // first sort by number of ingredients, then by name of ingredient
        const a = rowA.original.ingredients;
        const b = rowB.original.ingredients;
        // if the number of ingredients is the same, sort by name of ingredient
        const numberOfIngredientsA = () => {
          let optionalIngredientLength = Array.isArray(a[0]) ? a[0].length : 0;
          return a.length + optionalIngredientLength;
        };
        const numberOfIngredientsB = () => {
          let optionalIngredientLength = Array.isArray(b[0]) ? b[0].length : 0;
          return b.length + optionalIngredientLength;
        };

        // Do a secondary sort based on first ingredient name
        if (numberOfIngredientsA() === numberOfIngredientsB()) {         
          return b[0].name.localeCompare(a[0].name);
        }
        return numberOfIngredientsB() - numberOfIngredientsA();
      }
    },
    {
      accessorKey: "collection",
      header: ({ column }) => { return (
        <Button 
          variant="ghost" 
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Collection
          {column.getIsSorted() === false && <ArrowUpDown className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "asc" && <ArrowUp className="ml-2 h-4 w-4" />}
          {column.getIsSorted() === "desc" && <ArrowDown className="ml-2 h-4 w-4" />}
        </Button>
    )},
      cell: ({ row }) => {
        const collection = row.getValue("collection")
        return <div className="font-medium">{collection as string}</div>
      },
    },
  ], [data, ingredients])

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
      columnFilters,
    },
  })

  // Extract unique types for filter dropdown
  const types = [...new Set(data.map(recipe => recipe.type.name))];

  // Render Type cell with image and name
  const renderType = useCallback((type: Recipe['type']) => {
    return (
      <div className="flex items-center gap-2">
        <img src={type.image_url} alt={type.name} className="w-6 h-6" />
        <span>{type.name}</span>
      </div>
    );
  }, [data])

  // Render Ingredients cell
  const renderIngredients = useCallback((recipeIngredients: Recipe['ingredients'], idx: number) => {
    const Ingredient = (ingredient: Ingredient) => {
      return (
        <div className="flex flex-wrap gap-2" key={ingredient.id}>
          <div className="flex items-center gap-1">
            <img src={ingredient.image_url} alt={ingredient.name} className="w-6 h-6" />
            <span>{ingredient.name}</span>
          </div>
        </div>
      )
    }

    const getGenericImageUrl = (type: Ingredient['ingredient_type']) => {
      return ingredients.find((ing) => {
        return ing.ingredient_type === type && ing.is_generic
      })?.image_url
    }

    const getIngredientTypeByName = (name: Ingredient['name']) => {
      return ingredients.find((ing) => {
        return ing.name === name
      })?.ingredient_type
    }

    const getGenericImageUrlByIngredient = (ingredient: Ingredient) => {
      return getGenericImageUrl(getIngredientTypeByName(ingredient.name))
    }

    const getGenericNameByIngredient = (ingredient: Ingredient) => {
      const type = getIngredientTypeByName(ingredient.name)
      return ingredients.find((ing) => {
        return ing.ingredient_type === type && ing.is_generic
      })?.name
    }

    return (
      <div className="gap-2" key={idx}>
        {recipeIngredients.map((ingredient) => (
          // if ingredient is an array, it means it's an optional ingredient
          Array.isArray(ingredient) ? 
            <div className="gap-2 border rounded-md p-1" key={idx}>
              <span><img src={getGenericImageUrlByIngredient(ingredient[0])} alt={getGenericNameByIngredient(ingredient[0])} className="w-4 h-4" />One of:</span>
              <div className="gap-2">
                {ingredient.map((ing) => (
                  <Ingredient {...ing} key={ing.id} />
                ))}
              </div>
            </div>
           : <Ingredient {...ingredient} key={ingredient.id} />
        ))}
      </div>
    );
  }, [ingredients])

  const EmptyRow = () => {
    return <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No recipes found. 😕</TableCell></TableRow>
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
      <Input
          placeholder="Search recipes..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              Type: {table.getColumn("type")?.getFilterValue() as string ?? 'All'} <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => table.getColumn("type")?.setFilterValue(null)}>
              All
            </DropdownMenuItem>
            {types.map((type) => (
              <DropdownMenuItem key={type} onClick={() => {
                console.log(type);
                table.getColumn("type")?.setFilterValue(type)}
              }>
                {type}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex gap-4">
        <Combobox list={ingredients.map((ingredient) => ({ value: ingredient.name, label: ingredient.name, image_url: ingredient.image_url }))} 
          hidden={table.getColumn("ingredients")?.getFilterValue() as string[]}
          onSelect={(ingredient) => {
            const currentFilterValue = table.getColumn("ingredients")?.getFilterValue() as string[];
            const updatedFilterValue = [...(currentFilterValue || []), ingredient];
            table.getColumn("ingredients")?.setFilterValue(updatedFilterValue);
          }}
        />
        <div>
          {(table.getColumn("ingredients")?.getFilterValue() as string[])?.map((ingredient) => (
            <div key={ingredient} className='flex items-center gap-2 border rounded-md p-1'>
              <img src={ingredients.find((ing) => ing.name === ingredient)?.image_url} alt={ingredient} className="w-4 h-4" />
              {ingredient}{' '}
              <span onClick={() => {
                const currentFilterValue = table.getColumn("ingredients")?.getFilterValue() as string[];
                const updatedFilterValue = currentFilterValue?.filter((i) => i !== ingredient);
                table.getColumn("ingredients")?.setFilterValue(updatedFilterValue);
              }}>
              <X className="w-4 h-4" /></span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => {
          table.setColumnFilters(null)
          table.setSorting([])
        }}>
          Clear all
        </Button>
      </div>
      <Table>
        <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} style={{ width: '100%', display: 'inline-grid', gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr 2fr 2fr' }}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  { flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              )
            })}
          </TableRow>
        ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} style={{ width: '100%', display: 'inline-grid', gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr 1fr 2fr 2fr' }}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          )) : <EmptyRow />}
        </TableBody>
      </Table>
    </div>
  );
};