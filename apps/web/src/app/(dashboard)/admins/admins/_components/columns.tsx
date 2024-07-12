'use client'
import { ToolTip } from "@/components/Tooltip"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { calculateAge } from "@/lib/utils"
import { ColumnDef, Row } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import React, { ChangeEvent, useEffect, useRef, useState } from "react"
import { PiMagnifyingGlass, PiPlusBold, PiUserCircle, PiWarehouse, PiWarehouseBold, PiXCircle } from "react-icons/pi"
import { getRequest, patchRequest } from "@/lib/fetchRequests"
import { Warehouse } from "@/constants"
import ActiveIndicator from "@/components/sidebar/ActiveIndicator"
import { Role } from "../../_components/ExpTable"
import { Gender } from "@/app/(home)/(user-dashboard)/user/edit-profile/_components/EditProfileForm"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { Checkbox } from "@/components/ui/checkbox"
import { IWarehouse } from "../../warehouses/_components/columns"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"

export interface IAdmin {
    id: string;
    role: Role.WarAdm | Role.SuperAdm ;
    accountActive: boolean;
    fullName?: string;
    email: string;
    imgUrl?: string | null;
    password?: string;
    gender?: Gender;
    dob?: Date;
    createdAt: Date;
}

const AssignCell = ({ row }: { row: Row<IAdmin> }) => {
    const [ totalWarehouse, setTotalWarehouse ] = useState<Warehouse[]>([])
    const [ assignedWarehouse, setAssignedWarehouse ] = useState<Warehouse| null>()
    const [ isLoadingWarehouse, setIsLoadingWarehouse ] = useState<boolean>(true)
    const [ filteredWarehouse, setFilteredWarehouse ] = useState<Warehouse[]>();
    const adminId = row.original.id;
    const adminName = row.original.fullName;
    const router = useRouter()
    const searchRef = useRef<HTMLInputElement>(null)

    async function getTotalWarehouse() {
        try {
            const res = await getRequest('warehouses/all');
            const data = await res.json();
            if (res.ok) {
                setTotalWarehouse(data.data);
            } else {
                setTotalWarehouse([]);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Something went wrong on admin table", { description: "assign cell component had trouble fetching all warehouses" })
        } finally {
            setIsLoadingWarehouse(false)
        }
    }
    async function getWarehouseByAdmin() {
        try {
            const res = await getRequest(`warehouses/assigned-warehouse/${adminId}`);
            const data = await res.json();
            if (res.ok) {
                setAssignedWarehouse(data.data);
            } else {
                setAssignedWarehouse(null);
            }
        } catch (error) {
            toast.error(error instanceof Error? error.message : `Something went wrong while fetching assigned warehouse by admin id`)
        } 
    }

    useEffect(() => {
        getWarehouseByAdmin()
        getTotalWarehouse();
    }, [ ]);

    useEffect(() => {
        if (totalWarehouse) setFilteredWarehouse(totalWarehouse)
    }, [ totalWarehouse ])

    async function handleAssignAdmin(warehouse: IWarehouse) {
        try {
            const res = await patchRequest({ warehouseId: warehouse?.id, adminId }, 'warehouses/assign-admin-to-warehouse/');
            const data = await res.json();
            if (res.ok) {
                if (data.data) {
                    setAssignedWarehouse(data.data)
                    toast.success(data.message)
                    location.reload()
                }
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error instanceof Error? error.message : `Error while assigning ${adminName} to ${warehouse.warehouseName} warehouse`)
        } finally {
            router.refresh()
        }
    }

    async function handleDismissAdminFromWarehouse() {
        try {
            const res = await patchRequest({ warehouseId: assignedWarehouse?.id, adminId }, 'warehouses/dismiss-admin-from-warehouse/');
            const data = await res.json();
            if (res.ok) {
                setAssignedWarehouse(null)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error instanceof Error? error.message : `Error while dismissing ${adminName && adminName} from ${assignedWarehouse?.warehouseName} warehouse`)
        } finally {
            router.refresh()
        }
    }

    function handleWarehouseChange(e:React.ChangeEvent<HTMLInputElement>) {
        e.preventDefault()
        e.stopPropagation()
        const searchValue = searchRef?.current?.value
        if (searchValue) {
            const filtered = totalWarehouse.filter(warehouse => 
                warehouse.warehouseName.toLowerCase().includes(searchValue) || warehouse.province.toLowerCase().includes(searchValue)
            );
            setFilteredWarehouse(filtered);
        } else {
            setFilteredWarehouse(totalWarehouse);
        }
    }

    return (
        <>
            {
                assignedWarehouse ?
                    <ToolTip className="cursor-pointer" content={`Click to dismiss ${ adminName } from ${ assignedWarehouse.warehouseName } warehouse`}>
                        <span onClick={handleDismissAdminFromWarehouse}>{ assignedWarehouse?.warehouseName }</span>
                    </ToolTip>
                :
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <div className="flex justify-between w-full items-center">
                                <span className="p-2">Assign <span className="font-semibold">{adminName}</span> to:</span>
                                <div className="flex items-center relative">
                                    <Input key={'focus '} autoFocus onChange={handleWarehouseChange} ref={searchRef} className="w-72 focus-visible:ring-black/0 focus-visible:border-black/60 duration-200" placeholder="Search warehouse or province" type="text" />
                                    <PiMagnifyingGlass className="absolute right-2" />
                                </div>
                            </div>
                            {
                                !isLoadingWarehouse ?
                                    (filteredWarehouse && filteredWarehouse.length > 0) &&
                                        <>
                                            <DropdownMenuSeparator/>
                                            { filteredWarehouse?.map((warehouse: Warehouse) => (
                                                <DropdownMenuItem onClick={() => { handleAssignAdmin(warehouse) }} className="cursor-pointer" key={warehouse.id}>
                                                    <div className="flex gap-4 justify-between w-full">
                                                        <div className="flex items-center gap-2">
                                                            <PiWarehouse size={`1.2rem`} />
                                                            <span>{warehouse.warehouseName}</span>
                                                        </div>
                                                        <span className="font-semibold">({warehouse.province})</span>
                                                    </div>
                                                </DropdownMenuItem>
                                            )) }
                                        </>
                                    // :
                                    // <DropdownMenuItem>{ totalWarehouse && totalWarehouse.length > 0 ? 'All warehouse is fully assigned' : 
                                    //     <Link className="flex items-center gap-1" href={'/admins/warehouses'}><PiPlusBold/> Create New Warehouse</Link> 
                                    // }</DropdownMenuItem>
                                :
                                <DropdownMenuItem className="flex items-center gap-2">
                                    <Spinner size={'small'} />Fetching available warehouse, please wait
                                </DropdownMenuItem>
                            }
                        </DropdownMenuContent>
                    </DropdownMenu>
            }

        </>
    );
};

const ActionCell = ({ row }: { row: Row<IAdmin> }) => {
    const adminId = row.original.id
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem> 
                    <Link className="flex gap-1 items-center" href={`/admins/admins/${adminId}`}>
                        <PiUserCircle size={`1.2rem`} />
                        View admin details
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const Columns: ColumnDef<IAdmin>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
            checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'id',
        header: ({ column }) => {
            return (
            <Button variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
                No
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
            )
        },
        cell: ({ row }) => (
        <div className="capitalize">{row.index + 1}</div>
        ),
    },
    {
        accessorKey: "fullName",
        header: ({ column }) => {
        return (
            <Button variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Full Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        )
        },
        cell: ({ row }) => (
        <div className="capitalize">{row.getValue("fullName")}</div>
        ),
    },
    {
        accessorKey: "email",
        cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
    },
    {
        accessorKey: "accountActive",
        header: () => <div className="capitalize text-center">Status</div>,
        cell: ({ row }) => (
        <div className="flex justify-center">
            <ActiveIndicator isActive={row.getValue('accountActive')} activeText={"Admin is verified"} nonActiveText={"Admin is NOT verified"} />
        </div>
        ),
    },
    {
        accessorKey: "gender",
        header: "Gender",
        cell: ({ row }) => (
        <div className="capitalize">{`${row.getValue('gender') ? row.getValue('gender') : '-'}`}</div>
        ),
    },
    {
        accessorKey: "dob",
        header: "Age",
        cell: ({ row }) => (
        <div className="capitalize">{typeof calculateAge(row.getValue("dob")) === 'number' ? calculateAge(row.getValue("dob")) : '-'}</div>
        ),
        meta: {
        filterVariant: 'range',
        },
    },
    {
        id: "assign",
        enableHiding: false,
        header: () => {
        return <span className="truncate">Assigned Warehouse</span>
        },
        cell: AssignCell,
    },
    {
        id: "actions",
        enableHiding: false,
        header: () => {
        return <span>Action</span>
        },
        cell: ActionCell,
    },
]

export default Columns;
