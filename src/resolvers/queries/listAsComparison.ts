import { Types } from "mongoose";
import { List } from "../../schema/List";
import { User } from "../../schema/User";
import { IContext, IEntry, IEpisode } from "../../schema/types";
import { WatchProvider } from "../../schema/WatchProvider";

import { isBefore, isAfter, getUnixTime } from 'date-fns';

interface IArgs {
  id: string;
}

export default async function listAsComparison({id}: IArgs, context: IContext) {
  const lid = new Types.ObjectId(id)

  const list = await List.findOne({_id: lid}).lean().populate("entries.movie").populate("entries.tv_show").populate("owner");
  if (!list) {
    return;
  }

  if (!context.user) {
    console.log("list -> no context.user")
    return;
  }
  if (!list.owner._id.equals(context.user._id)) { // !
    console.log("list -> context.user, but differend id")
    return;
  }

  return list;
}