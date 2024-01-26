import { HttpResponse, http } from 'msw'
import { setupServer } from 'msw/node'
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import UserList from './UserList.vue'
import { render, screen, waitFor } from '../../../../test/helper'

const users = [
    {
      id: 1,
      username: 'user1',
      email: 'user1@mail.com'
    },
    {
      id: 2,
      username: 'user2',
      email: 'user2@mail.com'
    },
    {
      id: 3,
      username: 'user3',
      email: 'user3@mail.com'
    },
    {
      id: 4,
      username: 'user4',
      email: 'user4@mail.com'
    },
    {
      id: 5,
      username: 'user5',
      email: 'user5@mail.com'
    },
    {
      id: 6,
      username: 'user6',
      email: 'user6@mail.com'
    },
    {
      id: 7,
      username: 'user7',
      email: 'user7@mail.com'
    }
  ]

const page1 = {
    content: users,
    page: 0,
    size: 3,
    totalPages: 9
  }

const getPage = (page,size) => {

    const start = page * size;
    const end = start + size;
    const totalPages = Math.ceil(users.length/size);

    return {
        content: users.slice(start,end),
        page: page,
        size: size,
        totalPages: totalPages
      }

}

const server = setupServer(http.get('/api/v1/users',({request})=>{
    let url = new URL(request.url);
    let page = Number.parseInt(url.searchParams.get('page'))
    let size = Number.parseInt(url.searchParams.get('size'))

    if(Number.isNaN(size)) size = 5;
    if(Number.isNaN(page)) page = 0;

    return HttpResponse.json(getPage(page,size));
}))

beforeAll(() => server.listen());
afterAll(() => server.close());

beforeEach(() => server.resetHandlers());

describe('userList',() => {

    it('displays 3 users in list',async()=>{
        render(UserList);
        await waitFor(() =>expect(screen.queryAllByText(/user/).length).toBe(3))
    })


})