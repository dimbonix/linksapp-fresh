import { Handlers, PageProps } from "$fresh/server.ts";
import jsonProfile from "../profile.json" assert { type: "json" };
import type Profile from "../profile.type.ts";

import AvatarComponent from "../components/AvatarComponent.tsx";
import UsernameComponent from "../components/UsernameComponent.tsx";
import BioComponent from "../components/BioComponent.tsx";
import LocationComponent from "../components/LocationComponent.tsx";
import SocialLinksComponent from "../components/SocialLinksComponent.tsx";
import BannerComponent from "../components/BannerComponent.tsx";
import TabsIsland from "../islands/TabsIsland.tsx";
import ReadmeButtonIsland from "../islands/ReadmeButtonIsland.tsx";
import ProfileMisconfigComponent from "../components/ProfileMisconfigComponent.tsx";

import fetchFeed from "../utils/rss.ts";
import fetchMarkdown from "../utils/markdown.ts";

type HandlerProps = {
  feed: {
    title: string | undefined;
    date: Date | undefined;
    description: string | undefined;
    url: string | undefined;
  }[] | undefined;
  readmeText: string | undefined;
};

export const handler: Handlers<HandlerProps | null> = {
  async GET(_, ctx) {
    const profile: Profile = jsonProfile;
    const { readme, rss } = profile;

    let feed = undefined;
    let readmeText = undefined;

    if (rss) feed = await fetchFeed(rss);
    if (readme) readmeText = await fetchMarkdown(readme);

    return ctx.render({
      feed,
      readmeText,
    });
  },
};

export default function Home({ data }: PageProps<HandlerProps | null>) {
  if (!data) return <h1>Profile misconfiguration.</h1>;

  const profile: Profile = jsonProfile;
  const {
    avatar,
    username,
    bio,
    location,
    socialAccounts,
    announcement,
    links,
  } = profile;
  const { feed, readmeText } = data;

  // validate profile configuration
  if (!avatar) {
    return (
      <ProfileMisconfigComponent>
        Property <i>avatar</i> can't be empty.
      </ProfileMisconfigComponent>
    );
  }
  if (!username) {
    return (
      <ProfileMisconfigComponent>
        Property <i>username</i> can't be empty.
      </ProfileMisconfigComponent>
    );
  }
  if (!bio) {
    return (
      <ProfileMisconfigComponent>
        Property <i>bio</i> can't be empty.
      </ProfileMisconfigComponent>
    );
  }
  if (links.length === 0) {
    return (
      <ProfileMisconfigComponent>
        Property <i>links</i> can't be of length zero.
      </ProfileMisconfigComponent>
    );
  }

  return (
    <main class="w-10/12 sm:w-96 mx-auto">
      <div class="flex flex-col w-full mt-12 mb-28">
        <div class="flex flex-col items-center w-full w-full rounded-xl p-4">
          <AvatarComponent avatar={avatar} />
          <UsernameComponent username={username} />
          <BioComponent bio={bio} />
          {location && <LocationComponent location={location} />}
          {readmeText && <ReadmeButtonIsland readmeText={readmeText} />}
          <SocialLinksComponent socialAccounts={socialAccounts} />
          {announcement && (
            <BannerComponent
              title={announcement.title}
              text={announcement.text}
            />
          )}
          <TabsIsland links={links} feed={feed} />
        </div>
      </div>
    </main>
  );
}
