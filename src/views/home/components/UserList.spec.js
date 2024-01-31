import { HttpResponse, delay, http } from 'msw'
import { setupServer } from 'msw/node'
import {afterAll, beforeAll, beforeEach, describe, expect, it} from 'vitest'
import UserList from './UserList.vue'
import { render, router, screen, waitFor } from '../../../../test/helper'
import userEvent from '@testing-library/user-event'

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
    // console.log(request.url)
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

    it('displays next page button',async() => {
        render(UserList);
        await screen.findByText('user1');
        expect(screen.getByRole('button',{name:'Next'})).toBeInTheDocument();
    })

    it('doesnot display previous page button',async() => {
        render(UserList);
        await screen.findByText('user1');
        expect(screen.queryByRole('button',{name:'Previous'})).not.toBeInTheDocument();
    })

    it('doesnot display spinner',async() => {
        render(UserList);
        await screen.findByText('user1');
        expect(screen.queryByRole('status')).not.toBeInTheDocument();
    })

    describe('when user clicks next',() => {
        it('displays next page',async() => {

            const user = userEvent.setup();
            render(UserList);
            await screen.findByText('user1');
            const button = screen.queryByRole('button',{name:'Next'});
            await user.click(button);
            const user4 = await screen.findByText('user4');
            expect(user4).toBeInTheDocument();
        })

        it('displays previous page button',async() => {

            const user = userEvent.setup();
            render(UserList);
            await screen.findByText('user1');
            const button = screen.queryByRole('button',{name:'Next'});
            await user.click(button);
            const previousButton = await screen.findByRole('button',{name:'Previous'});
            expect(previousButton).toBeInTheDocument();

        })

        describe('when user clicks previous',() => {
            it('displays previous page',async() => {

                const user = userEvent.setup();
                render(UserList);
                await screen.findByText('user1');
                const button = screen.queryByRole('button',{name:'Next'});
                await user.click(button);
                const previousButton = await screen.findByRole('button',{name:'Previous'});
                await user.click(previousButton);
                const user1 = await screen.findByText('user1');
                expect(user1).toBeInTheDocument();

            })
        })

        describe('when last page is loaded',() => {
            it('doesnot display the next button',async() => {

                const user = userEvent.setup();
                render(UserList);
                await screen.findByText('user1');
                const button = screen.queryByRole('button',{name:'Next'});
                await user.click(button);
                await screen.findByText('user4');
                await user.click(button);
                await screen.findByText('user7');
                expect(button).not.toBeInTheDocument();
            })
        })
    })

    describe('when fetching user list for next or previous pages',() => {
        it('displays spinner',async() => {

            let resolveFunc;
            const promise = new Promise((resolve,reject) => {
                resolveFunc = resolve;
            })
            server.use(http.get('/api/v1/users',async()=>{
               await promise;
               return HttpResponse.json({});
            }))

            const user = userEvent.setup();

            render(UserList);
            const button = screen.getByRole('button',{name:'Next'});
            await user.click(button);
            expect(screen.queryByRole('status')).toBeInTheDocument();
            await resolveFunc();
            await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())

        })
    })

    describe('when user clicks username',() => {
        it('navigates to user page',async() => {
            const user = userEvent.setup();
            render(UserList);
            const link = await screen.findByText('user1');
            await user.click(link);
            await waitFor(()=>{
                expect(router.currentRoute.value.path).toBe('/user/1');
            })
        })
    })
})