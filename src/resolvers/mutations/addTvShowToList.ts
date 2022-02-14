import { Types } from "mongoose";
import { List } from "../../schema/List";
import { TvShow } from "../../schema/TvShow";
import { IContext } from "../../schema/types";

interface IArgs {
  listId: string;
  tvShowId: string;
  seasonNumber?: number;
}

export default async function addTvShowToList({listId, tvShowId, seasonNumber}: IArgs, context: IContext) {
  if (!context.user) {
    console.log("addTvShowToList -> no user found in context");
    return false;
  }

  const lid = new Types.ObjectId(listId);
  const tid = new Types.ObjectId(tvShowId);

  const list = await List.findOne({'_id': lid});
  const tvShow = await TvShow.findOne({'_id': tid});

  if (list && list.owner._id.equals(context.user._id) && tvShow) {
    let season: number | undefined;

    if (!seasonNumber) { // no seasonNumber? take the newest
      season = tvShow.seasons.sort((a, b) => a.season_number - b.season_number).pop()?.season_number;
    } else {
      season = tvShow.seasons.find((e) => e.season_number === seasonNumber)?.season_number;
    }

    if (season) {
      if (!list.entries.some((e) => e.tv_show && e.tv_show._id.equals(tid) && e.season === season)) { // only add once
        const entry = {tv_show: tvShow, season: season, added_at: new Date()};
        await List.updateOne({'_id': lid}, { $push: { entries: entry }})
        return true;
      }
    }   
  }

  return false;

}
