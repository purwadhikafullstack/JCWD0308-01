import React from "react"
import Wrapper from "../../_components/Wrapper"
import { getUserServerSide } from "@/lib/utils";
import { cookies } from "next/headers";
import WishlistBlocks from "./_components.tsx/WishlistBlock";

export default async function Page() {

    const user = await getUserServerSide(cookies)

    return (
        <Wrapper title={"Wishlist"} className={""}>
            <WishlistBlocks user={user ? user : null} />
        </Wrapper>
    )
};

