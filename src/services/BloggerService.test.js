import { normalizeBlogListResponse } from './BloggerService';

describe('normalizeBlogListResponse', () => {
  it('keeps normal blog list items', () => {
    const response = {
      kind: 'blogger#blogList',
      items: [
        { id: '1', name: 'O Cosmos Racional' },
        { id: '2', name: 'The Rational Cosmos' }
      ]
    };

    expect(normalizeBlogListResponse(response).items).toEqual(response.items);
  });

  it('extracts blogs from blogUserInfos when Blogger returns per-user info', () => {
    const response = {
      kind: 'blogger#blogList',
      blogUserInfos: [
        {
          blog: { id: '1', name: 'O Cosmos Racional' },
          blog_user_info: { hasAdminAccess: true }
        },
        {
          blog: { id: '2', name: 'The Rational Cosmos' },
          blog_user_info: { hasAdminAccess: false }
        }
      ]
    };

    expect(normalizeBlogListResponse(response).items).toEqual([
      { id: '1', name: 'O Cosmos Racional' },
      { id: '2', name: 'The Rational Cosmos' }
    ]);
  });
});
