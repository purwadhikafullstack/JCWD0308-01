import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { PiClockCounterClockwiseBold } from "react-icons/pi";
import { RequestTable } from "./ReqWaitingTable"
import { useEffect, useState } from "react"
import { RequestHistoryTable } from "./reqHistoryTable"
import { MdOutlineScheduleSend } from "react-icons/md";
import { TransferTable } from "./trfTable"
import { MutationDialog } from "./mutationDialog"
import { getMutationRequest } from "@/app/action"

export function MutationTabs({selectedWH}:{selectedWH:string}) {
  const [open, setOpen] = useState(false)
  const [notif, setNotif] = useState(0)

  const getQty = async() => {
    const res = await getMutationRequest(selectedWH, 'waiting', 1, 5);
    if (res.status === 'ok') {
      setNotif(res.data.total);
    }
  }
  useEffect(()=> {
    if (selectedWH) {
      getQty()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH])

  return (
    <Tabs defaultValue="create" className="w-full">
      <TabsList className="grid md:w-72 grid-cols-2 ">
        <TabsTrigger value="create" className="text-xs">Create Requests</TabsTrigger>
        <TabsTrigger value="transfer" className="text-xs relative">
          <div>Transfer Queues</div>
          <div className={`absolute -top-2 -right-1 text-[0.6rem] text-white bg-red-500 rounded-full min-w-5 h-5 items-center justify-center ${notif > 0 ? 'flex' : 'hidden'}`}>
            {notif > 10 ? '10+' : notif}
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="create" >
        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="font-medium">Create Mutation Requests</CardTitle>
            <CardDescription>
              Send stock transfer request to other warehouses.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2 px-0">

            <div className="mb-10">
              <div className="flex justify-between items-center pb-2 flex-wrap gap-y-2">
                <div className="flex gap-1 items-center">
                  <p className="max-md:text-sm font-semibold">Waiting Approval</p>
                  <MdOutlineScheduleSend className="text-2xl"/>
                </div>
                <MutationDialog open={open} setOpen={setOpen} selectedWH={selectedWH}/>
              </div>
              <RequestTable selectedWH={selectedWH} open={open} setOpen={setOpen} />
            </div>

            <div>
              <div className="flex gap-1 items-center pb-2">
                <p className="max-md:text-sm font-semibold">Request History</p>
                <PiClockCounterClockwiseBold className="text-2xl"/>
              </div>
              <RequestHistoryTable open={open} selectedWH={selectedWH} setOpen={setOpen} />
            </div>

          </CardContent>

        </Card>
      </TabsContent>

      <TabsContent value="transfer">
        <Card className="border-none shadow-none">
          <CardHeader className="px-0">
            <CardTitle className="max-md:text-sm font-semibold">Approve Transfer Requests</CardTitle>
            <CardDescription>
              Accept or reject stock transfer requests from other warehouses.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 px-0">
            <div>
              <TransferTable open={open} selectedWH={selectedWH} setOpen={setOpen} getQty={getQty}/>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
