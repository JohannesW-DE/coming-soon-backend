import { Types } from "mongoose";
import { List } from "../../schema/List";
import { IContext } from "../../schema/types";
import { User } from "../../schema/User";


export default async function deleteAccount(args: any, context: IContext){
  if (!context.user) {
    console.log("deleteAccount -> no user found in context");
    return false;
  }

  console.log("PH: deleting account for user", context.user._id)

  return true;
}
