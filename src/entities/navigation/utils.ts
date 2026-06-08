import { UserPermissions } from '../admin/users/types.ts';
import { LandUseSlides, MobilitySlides, PeopleSlides, Slide, TrafficSlides } from '../dashboard/types.ts';
import { NAVIGATION_CONFIG } from './config.ts';
import { Chapter, NavigationChildren, NavigationGroup } from './types.ts';

type Path = (Chapter | NavigationGroup | Slide)[];

export function getAllowedPaths(permissions: UserPermissions[]): string[] {
  const allowedPaths = [];

  if (permissions.includes(UserPermissions.PEOPLE)) {
    allowedPaths.push(...PeopleSlides);
  }

  if (permissions.includes(UserPermissions.LAND_USE)) {
    allowedPaths.push(...LandUseSlides);
  }

  if (permissions.includes(UserPermissions.MOBILITY)) {
    allowedPaths.push(...MobilitySlides);
  }

  if (permissions.includes(UserPermissions.TRAFFIC)) {
    allowedPaths.push(...TrafficSlides);
  }

  if (permissions.includes(UserPermissions.USERS)) {
    allowedPaths.push('admin/users');
  }

  return allowedPaths;
}

export function getSlidePath(slide: Slide): Path {
  function search(children: NavigationChildren[], path: Path = []): Array<Chapter | NavigationGroup | Slide> | null {
    for (const child of children) {
      const currentPath = [...path, child.id];

      if (child.id === slide) return currentPath;

      if (child.children) {
        const result = search(child.children, currentPath);
        if (result) return result;
      }
    }

    return null;
  }

  for (const chapter of NAVIGATION_CONFIG) {
    const result = search(chapter.children, [chapter.id]);
    if (result) return result;
  }

  return [];
}

export function getFirstSlideByChapter(chapterId: Chapter): Slide | null {
  const chapter = NAVIGATION_CONFIG.find((chapter) => chapter.id === chapterId);

  if (!chapter) return null;

  const queue = [...chapter.children];
  for (const child of queue) {
    if (Object.values(Slide).includes(child.id as Slide)) return child.id as Slide;
    if (child.children) queue.push(...child.children);
  }
  return null;
}

export function getFirstSlideById(id: NavigationGroup | Slide): Slide | null {
  const queue = NAVIGATION_CONFIG.flatMap((chapter) => chapter.children);

  for (const item of queue) {
    if (item.id === id) {
      if (Object.values(Slide).includes(item.id as Slide)) return item.id as Slide;
      if (item.children) {
        for (const child of item.children) {
          if (Object.values(Slide).includes(child.id as Slide)) return child.id as Slide;
        }
      }
    }
    if (item.children) queue.push(...item.children);
  }

  return null;
}
